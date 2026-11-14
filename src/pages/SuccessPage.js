import React, { useEffect, useRef, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { projectFirestore, projectAuth } from "../firebase/config";
import { usePlan } from "../context/PlanContext";

// The plan is activated server-side by the `activatePlanOnPayment` Cloud
// Function once Stripe reports the payment as succeeded. This page only waits
// for that to land in Firestore and then redirects; it writes nothing.
const SLOW_AFTER_MS = 60 * 1000;

const SuccessPage = () => {
  const location = useLocation();
  const history = useHistory();
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get("session_id");

  const { updatePlan } = usePlan();

  const [error, setError] = useState(null);
  const [slow, setSlow] = useState(false);

  // updatePlan changes identity on every PlanContext render; keep the latest
  // in a ref so the listeners below are set up once per session id.
  const updatePlanRef = useRef(updatePlan);
  updatePlanRef.current = updatePlan;

  useEffect(() => {
    if (!sessionId) {
      setError("Missing session ID");
      return undefined;
    }

    const user = projectAuth.currentUser;
    if (!user) {
      history.replace("/login");
      return undefined;
    }

    let finished = false;
    const unsubscribers = [];
    const stop = () => unsubscribers.forEach((unsub) => unsub());

    const finish = ({ planId, planName, price }) => {
      if (finished) return;
      finished = true;
      stop();
      updatePlanRef.current({ planId, planName, price });
      history.replace("/admin/dashboard");
    };

    const customerRef = projectFirestore.collection("customers").doc(user.uid);

    // 1) The purchase the function writes for this checkout session.
    unsubscribers.push(
      customerRef
        .collection("purchases")
        .where("checkoutSessionId", "==", sessionId)
        .limit(1)
        .onSnapshot(
          (snap) => {
            if (!snap.empty) finish(snap.docs[0].data());
          },
          (err) => console.error("Purchase listener error:", err),
        ),
    );

    // 2) Fallback: the user's plan switching to the plan bought in this
    //    session (covers checkouts started before checkoutSessionId existed).
    customerRef
      .collection("checkout_sessions")
      .doc(sessionId)
      .get()
      .then((sessionSnap) => {
        if (finished) return;
        if (!sessionSnap.exists) {
          setError("Checkout session not found");
          return;
        }
        const planId = sessionSnap.data()?.metadata?.planId;
        if (!planId) return;
        unsubscribers.push(
          projectFirestore
            .collection("users")
            .doc(user.uid)
            .onSnapshot(
              (userSnap) => {
                const data = userSnap.data() || {};
                if (
                  data.subscriptionStatus === "active" &&
                  data.planId === planId
                ) {
                  finish(data);
                }
              },
              (err) => console.error("User listener error:", err),
            ),
        );
        // A listener added after cleanup ran must not leak.
        if (finished) stop();
      })
      .catch((err) => {
        console.error("Success page error:", err);
        setError(err.message || "Something went wrong");
      });

    const slowTimer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);

    return () => {
      finished = true;
      clearTimeout(slowTimer);
      stop();
    };
  }, [sessionId, history]);

  // ─────────────────────────────────────────────
  // UI STATES
  // ─────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <a href="/admin/dashboard">Go to dashboard</a>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <p>Processing your payment…</p>
      {slow && (
        <p style={{ maxWidth: 480, margin: "16px auto" }}>
          This is taking longer than usual. Your plan will be activated as
          soon as the payment is confirmed; you can keep this page open or
          check your <a href="/admin/dashboard">dashboard</a> in a few
          minutes. If it still isn't active, please contact support.
        </p>
      )}
    </div>
  );
};

export default SuccessPage;
