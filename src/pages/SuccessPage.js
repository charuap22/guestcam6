import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { projectFirestore, projectAuth } from "../firebase/config";
import { usePlan } from "../context/PlanContext";

const SuccessPage = () => {
  const location = useLocation();
  const history = useHistory();
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get("session_id");

  const { updatePlan } = usePlan();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        if (!sessionId) {
          throw new Error("Missing session ID");
        }

        const user = projectAuth.currentUser;
        if (!user) {
          history.replace("/login");
          return;
        }

        // ─────────────────────────────────────────────
        // Fetch checkout session
        // ─────────────────────────────────────────────
        const sessionRef = projectFirestore
          .collection("customers")
          .doc(user.uid)
          .collection("checkout_sessions")
          .doc(sessionId);

        const sessionSnap = await sessionRef.get();
        if (!sessionSnap.exists) {
          throw new Error("Checkout session not found");
        }

        const sessionData = sessionSnap.data();

        // 🛑 ALREADY PROCESSED → SAFE EXIT
        if (sessionData.processed) {
          history.replace("/admin/dashboard");
          return;
        }

        const {
          planId,
          planName,
          price = 0,
          upgrade,
          oldPlanId,
          couponCode,
        } = sessionData.metadata || {};

        if (!planId || !planName) {
          throw new Error("Missing plan metadata");
        }

        const purchasedAt = new Date();
        const subscriptionEndDate = new Date(purchasedAt);
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);

        const userRef = projectFirestore.collection("users").doc(user.uid);
        const purchaseRef = projectFirestore
          .collection("customers")
          .doc(user.uid)
          .collection("purchases")
          .doc();

        // ─────────────────────────────────────────────
        // Transaction (IDEMPOTENT)
        // ─────────────────────────────────────────────
        await projectFirestore.runTransaction(async (tx) => {
          tx.update(userRef, {
            planId,
            planName,
            price,
            subscribedOn: purchasedAt,
            subscriptionEndDate,
            subscriptionStatus: "active",
          });

          tx.set(purchaseRef, {
            planId,
            planName,
            price,
            purchasedAt,
            subscriptionEndDate,
            previousPlanId: upgrade === "true" ? oldPlanId : null,
            status: "active",
            couponCode: couponCode || null,
          });

          // 🔐 mark session as processed
          tx.update(sessionRef, {
            processed: true,
            processedAt: new Date(),
          });
        });

        if (couponCode) {
          const couponSnapshot = await projectFirestore
            .collection("coupons")
            .where("code", "==", couponCode)
            .limit(1)
            .get();

          if (!couponSnapshot.empty) {
            const couponDoc = couponSnapshot.docs[0];

            await couponDoc.ref.update({
              usedCount: (couponDoc.data().usedCount || 0) + 1,
            });
          }
        }
        
        // ─────────────────────────────────────────────
        // Update client plan context
        // ─────────────────────────────────────────────
        updatePlan({
          planId,
          planName,
          price,
        });

        // ✅ SINGLE, FINAL REDIRECT
        history.replace("/admin/dashboard");
      } catch (err) {
        console.error("Success page error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [sessionId, history, updatePlan]);

  // ─────────────────────────────────────────────
  // UI STATES
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        Processing your payment…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <a href="/admin/dashboard">Go to dashboard</a>
      </div>
    );
  }

  // Should never reach here (redirect happens)
  return null;
};

export default SuccessPage;
