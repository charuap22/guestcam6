// Emulator tests for functions/activation.js (server-side plan activation).
//
//   cd functions && npm test
//
// Runs the real Admin SDK against the Firestore emulator (started by
// `firebase emulators:exec`, which sets FIRESTORE_EMULATOR_HOST).

const {after, beforeEach, describe, it} = require("node:test");
const assert = require("node:assert/strict");
const admin = require("firebase-admin");
const {
  activatePayment,
  becameSucceeded,
  redeemGiftCoupon,
} = require("../activation");

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error("Run via `npm test` (needs the Firestore emulator)");
}

const PROJECT = "demo-guestcam-functions";
admin.initializeApp({projectId: PROJECT});
const db = admin.firestore();
const {Timestamp} = admin.firestore;

const NOW = new Date("2026-11-12T12:00:00Z");
const PAID_AT = Math.floor(NOW.getTime() / 1000) - 60;
const day = 24 * 60 * 60 * 1000;

async function clear() {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  const res = await fetch(
    `http://${host}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`,
    {method: "DELETE"},
  );
  if (!res.ok) throw new Error(`clear failed: ${res.status}`);
}

async function seed() {
  const put = (path, data) => db.doc(path).set(data);
  await Promise.all([
    put("users/alice", {role: "owner", planId: null, subscriptionStatus: null}),
    put("users/bob", {role: "owner", planId: "basic", price: 49, subscriptionStatus: "active"}),
    put("products/basic", {active: true, name: "Basic"}),
    put("products/basic/prices/p1", {unit_amount: 4900, currency: "cad"}),
    put("products/pro", {active: true, name: "Pro"}),
    put("products/pro/prices/p2", {unit_amount: 9900, currency: "cad"}),
    put("products/old", {active: false, name: "Old"}),
    put("products/old/prices/p3", {unit_amount: 100, currency: "cad"}),
    put("customers/bob/purchases/pb1", {
      planId: "basic", price: 49, status: "active",
      purchasedAt: Timestamp.fromDate(new Date(NOW.getTime() - 30 * day)),
    }),
    put("customers/alice/checkout_sessions/cs1", {
      mode: "payment", metadata: {planId: "basic", checkoutSessionId: "cs1"},
    }),
    put("coupons/SAVE10", {code: "SAVE10", type: "percentage", value: 10, active: true, usedCount: 0}),
    put("coupons/STALE", {
      code: "STALE", type: "percentage", value: 50, active: true, usedCount: 0,
      expiresAt: Timestamp.fromDate(new Date(NOW.getTime() - day)),
    }),
    put("coupons/GIFT", {code: "GIFT", type: "free_plan", value: 100, active: true, usedCount: 2}),
    put("coupons/OFF", {code: "OFF", type: "free_plan", value: 100, active: false, usedCount: 0}),
    put("coupons/GONE", {
      code: "GONE", type: "free_plan", value: 100, active: true, usedCount: 0,
      expiresAt: Timestamp.fromDate(new Date(NOW.getTime() - day)),
    }),
    put("affiliates/aff1", {name: "Ann", code: "FRIEND", commissionRate: 20, active: true}),
    put("affiliates/aff2", {name: "Old", code: "OLD", commissionRate: 50, active: false}),
  ]);
}

const payment = (over = {}) => ({
  id: "pi_x",
  object: "payment_intent",
  status: "succeeded",
  amount: 4900,
  amount_received: 4900,
  currency: "cad",
  created: PAID_AT,
  ...over,
  metadata: {
    userId: "alice",
    planId: "basic",
    planName: "Basic",
    chargedAmount: "49.00",
    couponCode: "",
    affiliateCode: "",
    checkoutSessionId: "cs1",
    ...(over.metadata || {}),
  },
});

after(() => admin.app().delete());

const pay = (uid, id, p) => activatePayment(db, admin, uid, id, p, NOW);
const get = async (path) => (await db.doc(path).get()).data();

describe("activatePayment (customers/{uid}/payments trigger)", () => {
  beforeEach(async () => {
    await clear();
    await seed();
  });

  it("activates a fully paid plan: user, purchase, sale, session", async () => {
    const res = await pay("alice", "pi_1", payment({metadata: {affiliateCode: "friend"}}));
    assert.equal(res.status, "activated");

    const user = await get("users/alice");
    assert.equal(user.planId, "basic");
    assert.equal(user.planName, "Basic");
    assert.equal(user.price, 49);
    assert.equal(user.subscriptionStatus, "active");
    assert.equal(user.role, "owner");
    assert.equal(user.subscriptionEndDate.toDate().getUTCFullYear(), 2027);

    const purchase = await get("customers/alice/purchases/pi_1");
    assert.equal(purchase.price, 49);
    assert.equal(purchase.amountPaid, 49);
    assert.equal(purchase.status, "active");
    assert.equal(purchase.checkoutSessionId, "cs1");
    assert.equal(purchase.previousPlanId, null);
    assert.equal(purchase.couponCode, null);

    const sale = await get("affiliateSales/sale_pi_1");
    assert.equal(sale.affiliateId, "aff1");
    assert.equal(sale.saleAmount, 49);
    assert.equal(sale.commissionAmount, 9.8);
    assert.equal(sale.status, "unpaid");

    const session = await get("customers/alice/checkout_sessions/cs1");
    assert.equal(session.processed, true);
    assert.equal(session.paymentId, "pi_1");

    const record = await get("paymentActivations/pi_1");
    assert.equal(record.status, "activated");
    assert.equal(record.expectedAmount, 4900);
  });

  it("price comes from the product, not the client-written metadata", async () => {
    const res = await pay("alice", "pi_1", payment({
      amount: 100, amount_received: 100,
      metadata: {chargedAmount: "1.00", planName: "Hacked"},
    }));
    assert.equal(res.status, "rejected");
    assert.equal(res.reason, "underpaid");
    assert.equal((await get("users/alice")).planId, null);
    assert.equal(await get("customers/alice/purchases/pi_1"), undefined);
    assert.equal((await get("paymentActivations/pi_1")).status, "rejected");
  });

  it("tax on top of the price is fine; price stays the pre-tax amount", async () => {
    const res = await pay("alice", "pi_1", payment({amount: 5537, amount_received: 5537}));
    assert.equal(res.status, "activated");
    const purchase = await get("customers/alice/purchases/pi_1");
    assert.equal(purchase.price, 49);
    assert.equal(purchase.amountPaid, 55.37);
  });

  it("is idempotent, including concurrent deliveries", async () => {
    const results = await Promise.all([
      pay("alice", "pi_1", payment({metadata: {couponCode: "SAVE10", affiliateCode: "FRIEND"}, amount_received: 4410})),
      pay("alice", "pi_1", payment({metadata: {couponCode: "SAVE10", affiliateCode: "FRIEND"}, amount_received: 4410})),
      pay("alice", "pi_1", payment({metadata: {couponCode: "SAVE10", affiliateCode: "FRIEND"}, amount_received: 4410})),
    ]);
    assert.deepEqual(results.map((r) => r.status).sort(), ["activated", "duplicate", "duplicate"]);
    assert.equal((await get("coupons/SAVE10")).usedCount, 1);
    const sales = await db.collection("affiliateSales").get();
    assert.equal(sales.size, 1);
    const purchases = await db.collection("customers/alice/purchases").get();
    assert.equal(purchases.size, 1);
  });

  it("applies a valid percentage coupon and counts its use", async () => {
    const res = await pay("alice", "pi_1", payment({
      amount: 4410, amount_received: 4410, metadata: {couponCode: "save10"},
    }));
    assert.equal(res.status, "activated");
    const purchase = await get("customers/alice/purchases/pi_1");
    assert.equal(purchase.price, 44.1);
    assert.equal(purchase.couponCode, "SAVE10");
    assert.equal((await get("coupons/SAVE10")).usedCount, 1);
  });

  it("an expired coupon gives no discount", async () => {
    const res = await pay("alice", "pi_1", payment({
      amount: 2450, amount_received: 2450, metadata: {couponCode: "STALE"},
    }));
    assert.equal(res.status, "rejected");
    assert.equal(res.reason, "underpaid");
    assert.equal((await get("coupons/STALE")).usedCount, 0);
  });

  it("a gift coupon gives no discount on a paid checkout", async () => {
    const res = await pay("alice", "pi_1", payment({
      amount: 50, amount_received: 50, metadata: {couponCode: "GIFT"},
    }));
    assert.equal(res.reason, "underpaid");
    assert.equal((await get("coupons/GIFT")).usedCount, 2);
  });

  it("full price with an unusable coupon still activates, coupon not counted", async () => {
    const res = await pay("alice", "pi_1", payment({metadata: {couponCode: "STALE"}}));
    assert.equal(res.status, "activated");
    assert.equal((await get("customers/alice/purchases/pi_1")).couponCode, null);
    assert.equal((await get("coupons/STALE")).usedCount, 0);
  });

  it("upgrade credit is the customer's latest purchase price", async () => {
    const res = await pay("bob", "pi_2", payment({
      amount: 5000, amount_received: 5000,
      metadata: {userId: "bob", planId: "pro", checkoutSessionId: "", upgrade: "true", oldPlanId: "pro"},
    }));
    assert.equal(res.status, "activated");
    const user = await get("users/bob");
    assert.equal(user.planId, "pro");
    assert.equal(user.price, 50);
    const purchase = await get("customers/bob/purchases/pi_2");
    assert.equal(purchase.previousPlanId, "basic");
  });

  it("an upgrade cannot claim credit the customer does not have", async () => {
    const res = await pay("alice", "pi_2", payment({
      amount: 5000, amount_received: 5000,
      metadata: {planId: "pro", upgrade: "true", oldPlanId: "basic"},
    }));
    assert.equal(res.reason, "underpaid");
  });

  it("rejects a non-CAD payment", async () => {
    const res = await pay("alice", "pi_1", payment({currency: "jpy"}));
    assert.equal(res.reason, "wrong-currency");
    assert.equal((await get("users/alice")).planId, null);
  });

  it("rejects unknown or inactive plans and missing planId", async () => {
    assert.equal((await pay("alice", "pi_a", payment({metadata: {planId: "nope"}}))).reason, "unknown-plan");
    assert.equal((await pay("alice", "pi_b", payment({metadata: {planId: "old"}}))).reason, "unknown-plan");
    assert.equal((await pay("alice", "pi_c", payment({metadata: {planId: ""}}))).reason, "no-plan");
    assert.equal((await pay("alice", "pi_d", payment({metadata: {planId: "../users"}}))).reason, "no-plan");
  });

  it("ignores payments that have not succeeded", async () => {
    const res = await pay("alice", "pi_1", payment({status: "processing"}));
    assert.equal(res.status, "ignored");
    assert.equal(await get("paymentActivations/pi_1"), undefined);
  });

  it("an inactive affiliate code records no sale", async () => {
    await pay("alice", "pi_1", payment({metadata: {affiliateCode: "OLD"}}));
    assert.equal(await get("affiliateSales/sale_pi_1"), undefined);
  });
});

describe("becameSucceeded (which payment writes trigger activation)", () => {
  const ok = {status: "succeeded"};
  it("fires when a payment is created as, or moves to, succeeded", () => {
    assert.equal(becameSucceeded(null, ok), true);
    assert.equal(becameSucceeded({status: "processing"}, ok), true);
    assert.equal(becameSucceeded({status: "requires_action"}, ok), true);
  });
  it("ignores later writes to an already-succeeded payment (refunds, re-syncs)", () => {
    // e.g. payments activated by the old browser flow before this function existed
    assert.equal(becameSucceeded(ok, {...ok, amount_refunded: 525}), false);
    assert.equal(becameSucceeded(ok, ok), false);
  });
  it("ignores deletes and non-succeeded states", () => {
    assert.equal(becameSucceeded(ok, null), false);
    assert.equal(becameSucceeded(null, {status: "processing"}), false);
    assert.equal(becameSucceeded(null, {status: "canceled"}), false);
  });
});

describe("redeemGiftCoupon (callable)", () => {
  beforeEach(async () => {
    await clear();
    await seed();
  });

  const redeem = (uid, data) => redeemGiftCoupon(db, admin, uid, data, NOW);
  const rejects = (promise, code) =>
    assert.rejects(promise, (err) => {
      assert.equal(err.code, code);
      return true;
    });

  it("activates the plan, records the purchase, counts the use", async () => {
    const res = await redeem("alice", {code: "gift", planId: "basic", affiliateCode: "FRIEND"});
    assert.deepEqual(res, {planId: "basic", planName: "Basic"});
    const user = await get("users/alice");
    assert.equal(user.planId, "basic");
    assert.equal(user.subscriptionStatus, "active");
    assert.equal(user.gift, true);
    assert.equal(user.price, 0);
    const purchase = await get("customers/alice/purchases/gift_GIFT");
    assert.equal(purchase.status, "gift");
    assert.equal(purchase.couponCode, "GIFT");
    assert.equal((await get("coupons/GIFT")).usedCount, 3);
    const sale = await get("affiliateSales/sale_gift_alice_GIFT");
    assert.equal(sale.saleAmount, 0);
    assert.equal(sale.commissionAmount, 0);
  });

  it("each customer can redeem a given coupon once", async () => {
    await redeem("alice", {code: "GIFT", planId: "basic"});
    await rejects(redeem("alice", {code: "GIFT", planId: "pro"}), "already-exists");
    await redeem("bob", {code: "GIFT", planId: "pro"});
    assert.equal((await get("coupons/GIFT")).usedCount, 4);
  });

  it("concurrent redemptions count once", async () => {
    const results = await Promise.allSettled([
      redeem("alice", {code: "GIFT", planId: "basic"}),
      redeem("alice", {code: "GIFT", planId: "basic"}),
    ]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal((await get("coupons/GIFT")).usedCount, 3);
  });

  it("rejects unknown, disabled, expired and non-gift coupons", async () => {
    await rejects(redeem("alice", {code: "NOPE", planId: "basic"}), "not-found");
    await rejects(redeem("alice", {code: "OFF", planId: "basic"}), "failed-precondition");
    await rejects(redeem("alice", {code: "GONE", planId: "basic"}), "failed-precondition");
    await rejects(redeem("alice", {code: "SAVE10", planId: "basic"}), "failed-precondition");
    assert.equal((await get("users/alice")).planId, null);
  });

  it("rejects missing input and unknown or inactive plans", async () => {
    await rejects(redeem("alice", {}), "invalid-argument");
    await rejects(redeem("alice", {code: "GIFT"}), "invalid-argument");
    await rejects(redeem("alice", {code: "GIFT", planId: "nope"}), "not-found");
    await rejects(redeem("alice", {code: "GIFT", planId: "old"}), "not-found");
    assert.equal((await get("coupons/GIFT")).usedCount, 2);
  });
});
