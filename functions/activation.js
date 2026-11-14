/**
 * Server-side plan activation.
 *
 * Replaces the browser-side activation that used to live in
 * src/pages/SuccessPage.js (paid plans) and src/pages/Pricing.js
 * (activateGiftPlan). Everything here runs with the Admin SDK, so it is not
 * subject to firestore.rules; once this is live the rules can be switched to
 * phase 2 (allowClientSideActivation() == false).
 *
 * Trust model
 * -----------
 * customers/{uid}/payments/{paymentId} is written only by the
 * firestore-stripe-payments extension (clients have read-only access), so the
 * uid in the path, `status`, `amount_received`, `currency` and `created` are
 * Stripe's. Its `metadata` is copied from the checkout_sessions doc the
 * customer created, so plan / coupon / affiliate codes in it are only *claims*:
 * the price is recomputed from admin-controlled data (products/{id}/prices,
 * coupons, the customer's own server-written purchases) and the payment is
 * activated only if Stripe actually received at least that amount in CAD.
 */

const CURRENCY = "cad";
// Pricing.js rounds the charge to cents; allow one cent of slack.
const AMOUNT_TOLERANCE_CENTS = 1;
const MAX_METADATA_ID_LENGTH = 200;

/** An expected, non-retryable activation failure. */
class ActivationError extends Error {
  /**
   * @param {string} code machine-readable reason
   * @param {string} message human-readable detail
   */
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

/**
 * @param {*} value
 * @return {string} trimmed string, or "" when not a usable string
 */
function cleanString(value) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_METADATA_ID_LENGTH);
}

/**
 * A string usable as a Firestore document id, or "".
 * @param {*} value
 * @return {string}
 */
function cleanDocId(value) {
  const id = cleanString(value);
  if (!id || id.includes("/") || id === "." || id === "..") return "";
  if (/^__.*__$/.test(id)) return "";
  return id;
}

/**
 * @param {*} ts Firestore Timestamp, Date or null
 * @return {number|null} epoch millis
 */
function toMillis(ts) {
  if (!ts) return null;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (ts instanceof Date) return ts.getTime();
  return null;
}

/**
 * Same price Pricing.js shows: the plan's first price document.
 * @param {FirebaseFirestore.Transaction} tx
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} planId
 * @return {Promise<{planName: string, unitAmount: number}>}
 */
async function loadPlan(tx, db, planId) {
  const productRef = db.collection("products").doc(planId);
  const [productSnap, pricesSnap] = await Promise.all([
    tx.get(productRef),
    tx.get(productRef.collection("prices")),
  ]);
  if (!productSnap.exists || productSnap.get("active") !== true) {
    throw new ActivationError("unknown-plan", `No active product ${planId}`);
  }
  const firstPrice = pricesSnap.docs[0];
  const unitAmount = firstPrice ? Number(firstPrice.get("unit_amount")) : NaN;
  if (!Number.isFinite(unitAmount) || unitAmount < 0) {
    throw new ActivationError("no-price", `Product ${planId} has no price`);
  }
  return {planName: productSnap.get("name") || planId, unitAmount};
}

/**
 * @param {FirebaseFirestore.Transaction} tx
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} code
 * @return {Promise<FirebaseFirestore.QueryDocumentSnapshot|null>}
 */
async function findCoupon(tx, db, code) {
  if (!code) return null;
  const snap = await tx.get(
    db.collection("coupons").where("code", "==", code).limit(1),
  );
  return snap.empty ? null : snap.docs[0];
}

/**
 * @param {FirebaseFirestore.Transaction} tx
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} code
 * @return {Promise<FirebaseFirestore.QueryDocumentSnapshot|null>}
 */
async function findActiveAffiliate(tx, db, code) {
  if (!code) return null;
  const snap = await tx.get(
    db
      .collection("affiliates")
      .where("code", "==", code.toUpperCase())
      .where("active", "==", true)
      .limit(1),
  );
  return snap.empty ? null : snap.docs[0];
}

/**
 * @param {FirebaseFirestore.QueryDocumentSnapshot} affiliateDoc
 * @param {number} saleAmount dollars
 * @param {string} note
 * @param {Date} createdAt
 * @return {object} affiliateSales document
 */
function affiliateSale(affiliateDoc, saleAmount, note, createdAt) {
  const affiliate = affiliateDoc.data();
  const commissionRate = Number(affiliate.commissionRate) || 0;
  return {
    affiliateId: affiliateDoc.id,
    affiliateCode: affiliate.code,
    affiliateName: affiliate.name || "",
    saleAmount,
    commissionRate,
    commissionAmount: Math.round(saleAmount * commissionRate) / 100,
    note,
    status: "unpaid",
    payoutId: null,
    createdAt,
  };
}

/**
 * Whether a write to customers/{uid}/payments/{id} is the payment becoming
 * succeeded. Later writes to an already-succeeded payment (the extension
 * re-syncs it on refunds and other Stripe events) must not activate it again:
 * payments made before this function existed were activated by the browser
 * and have no paymentActivations record to dedupe against.
 *
 * @param {object|null} before payment data before the write
 * @param {object|null} after payment data after the write
 * @return {boolean}
 */
function becameSucceeded(before, after) {
  if (!after || after.status !== "succeeded") return false;
  return !before || before.status !== "succeeded";
}

/**
 * Activate the plan paid for by a succeeded Stripe payment. Idempotent: the
 * outcome is recorded in paymentActivations/{paymentId} inside the same
 * transaction, and a payment that already has a record is skipped.
 *
 * @param {FirebaseFirestore.Firestore} db Admin SDK Firestore
 * @param {object} admin firebase-admin namespace (for FieldValue/Timestamp)
 * @param {string} uid customer uid, from the payment document path
 * @param {string} paymentId payment document id (Stripe PaymentIntent id)
 * @param {object} payment payment document data
 * @param {Date=} now defaults to the current time
 * @return {Promise<object>} {status, reason}
 */
async function activatePayment(db, admin, uid, paymentId, payment, now) {
  now = now || new Date();
  if (!payment || payment.status !== "succeeded") {
    return {status: "ignored", reason: "not-succeeded"};
  }

  const metadata = payment.metadata || {};
  const planId = cleanDocId(metadata.planId);
  const couponCode = cleanString(metadata.couponCode).toUpperCase();
  const affiliateCode = cleanString(metadata.affiliateCode);
  const checkoutSessionId = cleanDocId(metadata.checkoutSessionId);

  const activationRef = db.collection("paymentActivations").doc(paymentId);
  const userRef = db.collection("users").doc(uid);
  const customerRef = db.collection("customers").doc(uid);
  const purchaseRef = customerRef.collection("purchases").doc(paymentId);
  const saleRef = db.collection("affiliateSales").doc(`sale_${paymentId}`);
  const sessionRef = checkoutSessionId ?
    customerRef.collection("checkout_sessions").doc(checkoutSessionId) :
    null;

  const amountReceived = Number(
    payment.amount_received != null ? payment.amount_received : payment.amount,
  );
  const currency = cleanString(payment.currency).toLowerCase();
  // Stripe's own creation time for the payment (seconds).
  const paidAt = Number(payment.created) > 0 ?
    new Date(Number(payment.created) * 1000) :
    now;

  return db.runTransaction(async (tx) => {
    // ── reads ───────────────────────────────────────────────
    const activationSnap = await tx.get(activationRef);
    if (activationSnap.exists) {
      return {status: "duplicate", reason: activationSnap.get("status")};
    }

    const record = (status, extra) => {
      tx.set(activationRef, {
        uid,
        paymentId,
        status,
        planId: planId || null,
        couponCode: couponCode || null,
        affiliateCode: affiliateCode || null,
        checkoutSessionId: checkoutSessionId || null,
        amountReceived: Number.isFinite(amountReceived) ? amountReceived : null,
        currency: currency || null,
        processedAt: now,
        ...extra,
      });
    };

    try {
      if (!planId) {
        throw new ActivationError("no-plan", "Payment metadata has no planId");
      }
      if (currency !== CURRENCY) {
        throw new ActivationError(
          "wrong-currency",
          `Expected ${CURRENCY}, got ${currency || "none"}`,
        );
      }
      if (!Number.isFinite(amountReceived) || amountReceived < 0) {
        throw new ActivationError("no-amount", "Payment has no amount");
      }

      const plan = await loadPlan(tx, db, planId);
      const couponDoc = await findCoupon(tx, db, couponCode);
      const affiliateDoc = await findActiveAffiliate(tx, db, affiliateCode);
      const latestPurchase = await tx.get(
        customerRef
          .collection("purchases")
          .orderBy("purchasedAt", "desc")
          .limit(1),
      );
      const sessionSnap = sessionRef ? await tx.get(sessionRef) : null;

      // ── expected charge, mirroring Pricing.js handleCheckout ──
      // A percentage coupon only counts if it was valid when Stripe created
      // the payment.
      let discountPercent = 0;
      if (couponDoc) {
        const coupon = couponDoc.data();
        const expires = toMillis(coupon.expiresAt);
        const value = Number(coupon.value);
        if (
          coupon.active === true &&
          coupon.type === "percentage" &&
          (expires === null || expires > paidAt.getTime()) &&
          Number.isFinite(value) &&
          value > 0 &&
          value <= 100
        ) {
          discountPercent = value;
        }
      }
      const originalPrice = plan.unitAmount / 100;
      const discountedPrice =
        originalPrice - (originalPrice * discountPercent) / 100;
      const previous = latestPurchase.empty ? null : latestPurchase.docs[0];
      const currentPlanPrice = previous ?
        parseFloat(previous.get("price") || 0) || 0 :
        0;
      const expectedCents = Math.round(
        Number(Math.max(0, discountedPrice - currentPlanPrice).toFixed(2)) *
          100,
      );

      if (amountReceived + AMOUNT_TOLERANCE_CENTS < expectedCents) {
        throw new ActivationError(
          "underpaid",
          `Received ${amountReceived} ${currency}, expected ${expectedCents}`,
        );
      }

      // ── writes ──────────────────────────────────────────────
      // `price` keeps its old meaning (pre-tax amount charged, in dollars):
      // the admin dashboard sums it as revenue and Pricing.js uses it as the
      // upgrade credit. amount_received may also include tax, so it is stored
      // separately as amountPaid.
      const price = expectedCents / 100;
      const subscriptionEndDate = new Date(now);
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
      const appliedCoupon = discountPercent > 0 ? couponDoc : null;

      tx.set(
        userRef,
        {
          planId,
          planName: plan.planName,
          price,
          subscribedOn: now,
          subscriptionEndDate,
          subscriptionStatus: "active",
        },
        {merge: true},
      );

      tx.set(purchaseRef, {
        planId,
        planName: plan.planName,
        price,
        amountPaid: amountReceived / 100,
        currency,
        purchasedAt: now,
        subscriptionEndDate,
        previousPlanId: previous ? previous.get("planId") || null : null,
        status: "active",
        couponCode: appliedCoupon ? appliedCoupon.get("code") : null,
        paymentId,
        checkoutSessionId: checkoutSessionId || null,
      });

      if (appliedCoupon) {
        tx.update(appliedCoupon.ref, {
          usedCount: admin.firestore.FieldValue.increment(1),
        });
      }

      if (affiliateDoc) {
        tx.set(saleRef, affiliateSale(affiliateDoc, price, plan.planName, now));
      }

      if (sessionSnap && sessionSnap.exists) {
        tx.update(sessionRef, {
          processed: true,
          processedAt: now,
          paymentId,
        });
      }

      record("activated", {
        expectedAmount: expectedCents,
        price,
        purchaseId: paymentId,
      });
      return {status: "activated"};
    } catch (err) {
      if (!(err instanceof ActivationError)) throw err; // retried
      record("rejected", {reason: err.code, detail: err.message});
      return {status: "rejected", reason: err.code};
    }
  });
}

/**
 * Redeem a 100% "free_plan" gift coupon for the signed-in user.
 *
 * @param {FirebaseFirestore.Firestore} db Admin SDK Firestore
 * @param {object} admin firebase-admin namespace
 * @param {string} uid caller uid (from the callable's auth context)
 * @param {object} data {code, planId, affiliateCode}
 * @param {Date=} now defaults to the current time
 * @return {Promise<{planId: string, planName: string}>}
 */
async function redeemGiftCoupon(db, admin, uid, data, now) {
  now = now || new Date();
  const code = cleanString(data && data.code).toUpperCase();
  const planId = cleanDocId(data && data.planId);
  const affiliateCode = cleanString(data && data.affiliateCode);
  if (!code) throw new ActivationError("invalid-argument", "Missing coupon");
  if (!planId) throw new ActivationError("invalid-argument", "Missing plan");

  return db.runTransaction(async (tx) => {
    const couponDoc = await findCoupon(tx, db, code);
    if (!couponDoc) {
      throw new ActivationError("not-found", "Invalid coupon");
    }
    const coupon = couponDoc.data();
    if (coupon.active !== true) {
      throw new ActivationError("failed-precondition", "Coupon disabled");
    }
    if (coupon.type !== "free_plan") {
      throw new ActivationError(
        "failed-precondition",
        "This coupon is not a gift package",
      );
    }
    const expires = toMillis(coupon.expiresAt);
    if (expires !== null && expires <= now.getTime()) {
      throw new ActivationError("failed-precondition", "Coupon expired");
    }

    const plan = await loadPlan(tx, db, planId).catch((err) => {
      if (err instanceof ActivationError) {
        throw new ActivationError("not-found", "Unknown plan");
      }
      throw err;
    });

    // One redemption of a given gift coupon per customer.
    const purchaseRef = db
      .collection("customers")
      .doc(uid)
      .collection("purchases")
      .doc(`gift_${couponDoc.id}`);
    const existing = await tx.get(purchaseRef);
    if (existing.exists) {
      throw new ActivationError(
        "already-exists",
        "You have already redeemed this coupon",
      );
    }
    const affiliateDoc = await findActiveAffiliate(tx, db, affiliateCode);

    tx.set(
      db.collection("users").doc(uid),
      {
        planId,
        planName: plan.planName,
        price: 0,
        subscribedOn: now,
        subscriptionStatus: "active",
        gift: true,
      },
      {merge: true},
    );
    tx.set(purchaseRef, {
      planId,
      planName: plan.planName,
      price: 0,
      purchasedAt: now,
      status: "gift",
      gift: true,
      couponCode: coupon.code,
    });
    tx.update(couponDoc.ref, {
      usedCount: admin.firestore.FieldValue.increment(1),
    });
    if (affiliateDoc) {
      tx.set(
        db.collection("affiliateSales").doc(`sale_gift_${uid}_${couponDoc.id}`),
        affiliateSale(affiliateDoc, 0, `${plan.planName} (gift coupon)`, now),
      );
    }
    return {planId, planName: plan.planName};
  });
}

module.exports = {
  ActivationError,
  activatePayment,
  becameSucceeded,
  redeemGiftCoupon,
};
