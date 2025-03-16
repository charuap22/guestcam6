import { useState, useEffect } from "react";
import { projectAuth, projectFirestore } from "../firebase/config";
import { useAuthContext } from "./useAuthContext";
import { usePlan } from "./usePlan";
import { useHistory } from "react-router-dom";
import { useDocument } from "./useDocument";
import firebase from "firebase/app";
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
      history.push(`/dashboard`);
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
  const Googlelogin = async () => {
    setError(null);
    setIsPending(true);

    try {
      // login
      // Creates the provider object.
      var provider = new firebase.auth.GoogleAuthProvider();
      const res = await projectAuth.signInWithPopup(provider);

      // update online status
      const documentRef = projectFirestore
        .collection("users")
        .doc(res.user.uid);
      await documentRef.update({ online: true });

      dispatch({ type: "LOGIN", payload: res.user });
      history.push(`/dashboard`);

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
    const Facebooklogin = async () => {
      setError(null);
      setIsPending(true);

      try {
        // login
        // Creates the provider object.
        var provider = new firebase.auth.FacebookAuthProvider()
        const res = await projectAuth.signInWithPopup(provider);

        // update online status
        const documentRef = projectFirestore
          .collection("users")
          .doc(res.user.uid);
        await documentRef.update({ online: true });

        dispatch({ type: "LOGIN", payload: res.user });
        history.push(`/dasboard`);

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

  return { login, Googlelogin,Facebooklogin, isPending, error };
};
