import { useState, useEffect } from "react";
import { projectAuth, projectFirestore } from "../firebase/config";
import { useAuthContext } from "./useAuthContext";


export const usePricing = () => {
  const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  // get logged in user
  const { user } = useAuthContext();

  const setUserPlan = async (plan) => {
    setError(null);
    setIsPending(true);

    try {
      // update online status
      const documentRef = projectFirestore.collection("users").doc(user.uid);
      await documentRef.update({ planId: plan.id });

      if (!isCancelled) {
        setIsPending(false);
        setError(null);
      }
    } catch (err) {
      if (!isCancelled) {
        setError(err.message);
        setIsPending(false);
      }
    }
  };

  useEffect(() => {
    return () => setIsCancelled(true);
  }, []);

  return { setUserPlan, isPending, error };
};
