import { useState, useEffect } from "react";
import { projectAuth, projectFirestore } from "../firebase/config";
import { useAuthContext } from "./useAuthContext";
import { usePlan } from "./usePlan";
import { useHistory } from "react-router-dom";
import { useDocument } from "./useDocument";

export const useLogin = () => {
  const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();
 

  let history = useHistory();
  const login = async (email, password) => {
    setError(null);
    setIsPending(true);

    try {
      // login
      const res = await projectAuth.signInWithEmailAndPassword(email, password);

      // update online status
      const documentRef = projectFirestore
        .collection("users")
        .doc(res.user.uid);
      await documentRef.update({ online: true });

      dispatch({ type: "LOGIN", payload: res.user });
      history.push(`/`);
      // projectFirestore
      //   .collection("users")
      //   .doc(res.user.uid)
      //   .get()
      //   .then((doc) => {
      //     if (doc.exists) {
      //       if (doc.data().planId) {
      //         changePlan(doc.data().planId);
      //       } else {
      //         setIsPending(false);
      //         setError(null);

      //       }
      //     }
      //   });

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

  return { login, isPending, error };
};
