import React, { createContext, useContext, useState, useEffect } from "react";
import { projectFirestore, projectAuth } from "../firebase/config";

const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
 const [currentPlan, setCurrentPlan] = useState({ metadata: {} });
//useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const updatePlan = (newPlan) => {
    setCurrentPlan({
      planId: newPlan.planId,
      planName: newPlan.planName,
      price: newPlan.price,
      subscribedOn: new Date(),
      subscriptionEndDate: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ),
      subscriptionStatus: "active",
      guestStart: newPlan.NoOfGuests_start || "0",
      guestEnd: newPlan.NoOfGuests_end || "Unlimited",
    });
  };


  useEffect(() => {
    // ✅ Listen for auth state changes
    const unsubscribeAuth = projectAuth.onAuthStateChanged((authUser) => {
      if (authUser) {
        console.log("✅ User Logged In:", authUser.uid);
        setUser(authUser);
      } else {
        console.warn("🔴 No user logged in.");
        setUser(null);
        setCurrentPlan(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchPlanData = async () => {
      setLoading(true);
      try {
        console.log("Fetching plan for user:", user.uid);
        const userRef = projectFirestore.collection("users").doc(user.uid);
        const userSnap = await userRef.get();

        if (userSnap.exists) {
          const userData = userSnap.data();
          console.log("🔥 User Data:", userData);

          if (userData.planId) {
            const productRef = projectFirestore
              .collection("products")
              .doc(userData.planId);
            const productSnap = await productRef.get();

            const planName = productSnap.exists
              ? productSnap.data().name
              : "Unknown Plan";
            const guestStart = productSnap.exists
              ? productSnap.data().stripe_metadata_NoOfGuests_start
              : "0";
            const guestEnd = productSnap.exists
              ? productSnap.data().stripe_metadata_NoOfGuests_end
              : "Unlimited";

            console.log(
              `✅ Plan found: ${planName} (${guestStart}-${guestEnd} Guests)`
            );

            setCurrentPlan({
              planId: userData.planId,
              planName,
              price: userData.price,
              subscribedOn: userData.subscribedOn
                ? new Date(userData.subscribedOn.seconds * 1000)
                : null,
              subscriptionEndDate: userData.subscriptionEndDate
                ? new Date(userData.subscriptionEndDate.seconds * 1000)
                : null,
              subscriptionStatus: userData.subscriptionStatus,
              guestStart,
              guestEnd,
            });
          } else {
            console.warn("⚠️ No planId found in Firestore.");
            setCurrentPlan(null);
          }
        } else {
          console.error("❌ User document not found.");
        }
      } catch (err) {
        console.error("Error fetching plan data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [user]); // ✅ Only run when `user` changes

  return (
    <PlanContext.Provider value={{ currentPlan, loading, updatePlan }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  return useContext(PlanContext);
};
