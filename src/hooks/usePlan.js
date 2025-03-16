import { useState, useEffect } from "react";
import { projectFirestore, projectAuth } from "../firebase/config";
import { usePlan } from "../context/PlanContext";

export const usePlanData = () => {
  const { currentPlan, updatePlan } = usePlan();
  const [plan, setPlan] = useState(currentPlan);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      const user = projectAuth.currentUser;
      if (!user) {
        setError("No user logged in.");
        setLoading(false);
        return;
      }

      try {
        const userRef = projectFirestore.collection("users").doc(user.uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
          setError("User not found.");
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        if (!userData.planId) {
          setPlan(null);
          setLoading(false);
          return;
        }

        const productRef = projectFirestore
          .collection("products")
          .doc(userData.planId);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
          setError("Plan data not found.");
          setLoading(false);
          return;
        }

        const productData = productSnap.data();
        setPlan({
          planId: userData.planId,
          planName: productData.name,
          price: userData.price,
          subscribedOn: userData.subscribedOn
            ? new Date(userData.subscribedOn.seconds * 1000)
            : null,
          subscriptionEndDate: userData.subscriptionEndDate
            ? new Date(userData.subscriptionEndDate.seconds * 1000)
            : null,
          subscriptionStatus: userData.subscriptionStatus,
          guestStart: productData.stripe_metadata_NoOfGuests_start || "0",
          guestEnd: productData.stripe_metadata_NoOfGuests_end || "Unlimited",
        });

        updatePlan();
      } catch (err) {
        console.error("Error fetching plan data:", err);
        setError("Failed to fetch plan data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [updatePlan]);

  return { plan, loading, error };
};
