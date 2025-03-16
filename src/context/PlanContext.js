import React, { createContext, useContext, useState, useEffect } from "react";
import { projectFirestore, projectAuth } from "../firebase/config";

const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanData = async () => {
      const user = projectAuth.currentUser;
      if (!user) {
        setCurrentPlan(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = projectFirestore.collection("users").doc(user.uid);
        const unsubscribe = userRef.onSnapshot(async (doc) => {
          if (!doc.exists) {
            setCurrentPlan(null);
            setLoading(false);
            return;
          }

          const userData = doc.data();
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
            setCurrentPlan(null);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching plan data:", err);
        setLoading(false);
      }
    };

    fetchPlanData();
  }, []);

  // ✅ Function to update the plan manually
  const updatePlan = async () => {
    const user = projectAuth.currentUser;
    if (!user) return;

    try {
      const userRef = projectFirestore.collection("users").doc(user.uid);
      const userSnap = await userRef.get();

      if (userSnap.exists) {
        const userData = userSnap.data();
        console.log("🔄 Updating Plan Context with:", userData);

        setCurrentPlan({
          planId: userData.planId,
          planName: userData.planName,
          price: userData.price,
          subscribedOn: userData.subscribedOn
            ? new Date(userData.subscribedOn.seconds * 1000)
            : null,
          subscriptionEndDate: userData.subscriptionEndDate
            ? new Date(userData.subscriptionEndDate.seconds * 1000)
            : null,
          subscriptionStatus: userData.subscriptionStatus,
          guestStart: userData.guestStart || "0",
          guestEnd: userData.guestEnd || "Unlimited",
        });
      }
    } catch (err) {
      console.error("🔥 Error updating plan:", err);
    }
  };

  return (
    <PlanContext.Provider
      value={{ currentPlan, loading, updatePlan }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  return useContext(PlanContext);
};
