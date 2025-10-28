import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { projectFirestore, projectAuth } from "../firebase/config";
import { usePlan } from "../context/PlanContext"; // ✅ Import usePlan

const SuccessPage = () => {
  const location = useLocation();
  const history = useHistory();
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get("session_id");

  const [userData, setUserData] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [productName, setProductName] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const { updatePlan } = usePlan(); // ✅ Get updatePlan from context

  useEffect(() => {
    const fetchSessionAndUserData = async () => {
      if (!sessionId) return;
      try {
        const user = projectAuth.currentUser;
        if (!user) throw new Error("User not authenticated");

        console.log("✅ User ID:", user.uid);
        console.log("✅ Session ID:", sessionId);

        // Fetch session data
        const sessionRef = projectFirestore
          .collection("customers")
          .doc(user.uid)
          .collection("checkout_sessions")
          .doc(sessionId);
        const sessionSnap = await sessionRef.get();

        if (!sessionSnap.exists) throw new Error("No such session document!");
        const sessionData = sessionSnap.data();
        setSessionData(sessionData);
        console.log("Session Metadata:", sessionData.metadata);
        const { planId, price, upgrade, oldPlanId } =
          sessionData.metadata || {};
        const planName = sessionData.metadata?.planName || "Fetching..."; // Default text

        if (!sessionData.metadata?.planName) {
          const productRef = projectFirestore
            .collection("products")
            .doc(planId);
          const productSnap = await productRef.get();
          if (productSnap.exists) {
            setProductName(productSnap.data().name);
          }
        }

        const purchasedAt = new Date();
        const subscriptionEndDate = new Date(purchasedAt);
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1); // 1-year duration

        console.log("📌 Plan ID:", planId);
        console.log("📌 Plan Name:", planName);
        console.log("📌 Price:", price);

        if (!planId || !planName) {
          throw new Error("❌ Missing plan data in metadata!");
        }

        // Fetch Product Name from Firestore
        const productRef = projectFirestore.collection("products").doc(planId);
        const productSnap = await productRef.get();
        const productName = productSnap.exists
          ? productSnap.data().name
          : "Unknown Product";
        setProductName(productName);

        // References for Firestore Transaction
        const userRef = projectFirestore.collection("users").doc(user.uid);
        const userDoc = await userRef.get();
        const userDataFromFirestore = userDoc.exists ? userDoc.data() : {};

        const purchaseRef = projectFirestore
          .collection("customers")
          .doc(user.uid)
          .collection("purchases")
          .doc(); // Auto-generate ID

        // Run Firestore Transaction to ensure consistency
        await projectFirestore.runTransaction(async (transaction) => {
          // Update user document with active plan details
          transaction.update(userRef, {
            planId: planId || "Unknown Plan ID",
            planName: planName || "Unknown Plan", // Ensure fallback
            price: price || 0,
            subscribedOn: purchasedAt,
            subscriptionEndDate: subscriptionEndDate,
            subscriptionStatus: "active",
          });

          // Add new purchase record
          transaction.set(purchaseRef, {
            planId,
            planName,
            price,
            purchasedAt,
            subscriptionEndDate,
            previousPlanId: upgrade === "true" ? oldPlanId : null,
            status: "active",
          });
        });

        console.log("Transaction successful: User and Purchase updated.");

        // ✅ **Update Plan Context**
        updatePlan({
          planId,
          planName,
          price,
          NoOfGuests_start: sessionData.metadata.NoOfGuests_start || "0",
          NoOfGuests_end: sessionData.metadata.NoOfGuests_end || "Unlimited",
        });

        setUserData({
          displayName:
            user.displayName ||
            userDataFromFirestore.name ||
            user.email ||
            "User",
          planId,
          planName,
          subscribedOn: purchasedAt.toLocaleString(),
          subscriptionStatus: "active",
        });

        // ✅ Redirect to Dashboard after 3 seconds
        setTimeout(() => {
          // history.push("/dashboard");
        }, 3000);
      } catch (error) {
        console.error("🔥 Error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndUserData();
  }, [sessionId, updatePlan, history]); // ✅ Added updatePlan and navigate to dependencies


  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading...</h2>
    );
  }



  return (
    <div
      style={{
        textAlign: "center",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#4CAF50", fontSize: "28px" }}>
        🎉 Payment Successful!
      </h1>
      <p style={{ fontSize: "18px", marginBottom: "20px" }}>
        Thank you for your purchase, <strong>{userData?.displayName}</strong>!
      </p>

      <div
        style={{
          border: "2px solid #ddd",
          padding: "20px",
          borderRadius: "10px",
          display: "inline-block",
          textAlign: "left",
          backgroundColor: "#f9f9f9",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
        }}
      >
        {/* <p>
          <strong>User ID:</strong> {projectAuth.currentUser?.uid}
        </p> */}
        <p>
          <strong>Plan:</strong> {productName}
          {/* ({sessionData?.metadata.planId}) */}
        </p>
        <p>
          <strong>Subscription Status:</strong>{" "}
          {userData?.subscriptionStatus || "Pending"}
        </p>
        <p>
          <strong>Subscribed On:</strong> {userData?.subscribedOn || "N/A"}
        </p>
      </div>

      <p style={{ marginTop: "20px", fontSize: "16px", color: "#666" }}>
        🎊 Enjoy your subscription! Redirecting to your dashboard...
      </p>

      <p style={{ fontSize: "14px", marginTop: "10px", color: "#999" }}>
        If you are not redirected,{" "}
        <a
          href="/dashboard"
          style={{ color: "#007bff", textDecoration: "none" }}
        >
          click here
        </a>
        .
      </p>
    </div>
  );
};

export default SuccessPage;

