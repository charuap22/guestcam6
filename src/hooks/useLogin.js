// src/hooks/useLogin.js
import { useState, useEffect } from "react";
import { projectAuth, projectFirestore } from "../firebase/config";
import { useAuthContext } from "./useAuthContext";
import { useHistory } from "react-router-dom";
import firebase from "firebase/app";

export const useLogin = () => {
  const [isCancelled, setIsCancelled] = useState(false);

  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  // loading state specific to reset password
  const [resetPending, setResetPending] = useState(false);

  // Remember-me state (moved into the hook)
  const [remember, setRemember] = useState(false);
  const [rememberedEmail, setRememberedEmail] = useState("");

  const { dispatch } = useAuthContext();
  const history = useHistory();

  // read remembered email on mount
  useEffect(() => {
    try {
      const email = localStorage.getItem("rememberedEmail");
      if (email) {
        setRememberedEmail(email);
        setRemember(true);
      }
    } catch (err) {
      // ignore localStorage errors
      console.warn("localStorage read failed", err);
    }
  }, []);

  // helper: update localStorage based on remember flag and email
  const updateRemember = (email) => {
    try {
      if (remember) {
        localStorage.setItem("rememberedEmail", email);
        setRememberedEmail(email);
      } else {
        localStorage.removeItem("rememberedEmail");
        setRememberedEmail("");
      }
    } catch (err) {
      console.warn("localStorage write/remove failed", err);
    }
  };

  const login = async (email, password) => {
    setError(null);
    setIsPending(true);

    try {
      // login using v8 namespaced API wrapper you already export as projectAuth
      const res = await projectAuth.signInWithEmailAndPassword(email, password);

      // update online status
      const documentRef = projectFirestore
        .collection("users")
        .doc(res.user.uid);
      await documentRef.update({ online: true });

      dispatch({ type: "LOGIN", payload: res.user });
      history.push(`/admin/dashboard`);

      if (!isCancelled) {
        setIsPending(false);
        setError(null);
      }
      return res;
    } catch (err) {
      if (!isCancelled) {
        setError(err.message);
        setIsPending(false);
      }
      throw err;
    }
  };

  const Googlelogin = async () => {
    setError(null);
    setIsPending(true);

    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const res = await projectAuth.signInWithPopup(provider);

      const documentRef = projectFirestore
        .collection("users")
        .doc(res.user.uid);
      await documentRef.update({ online: true });

      dispatch({ type: "LOGIN", payload: res.user });
      history.push(`/admin/dashboard`);

      if (!isCancelled) {
        setIsPending(false);
        setError(null);
      }
      return res;
    } catch (err) {
      if (!isCancelled) {
        setError(err.message);
        setIsPending(false);
      }
      throw err;
    }
  };

  const Facebooklogin = async () => {
    setError(null);
    setIsPending(true);

    try {
      const provider = new firebase.auth.FacebookAuthProvider();
      const res = await projectAuth.signInWithPopup(provider);

      const documentRef = projectFirestore
        .collection("users")
        .doc(res.user.uid);
      await documentRef.update({ online: true });

      dispatch({ type: "LOGIN", payload: res.user });
      history.push(`/admin/dashboard`);

      if (!isCancelled) {
        setIsPending(false);
        setError(null);
      }
      return res;
    } catch (err) {
      if (!isCancelled) {
        setError(err.message);
        setIsPending(false);
      }
      throw err;
    }
  };

  // resetPassword now uses resetPending
  const resetPassword = async (email) => {
    setError(null);
    setResetPending(true);

    try {
      if (!email) throw new Error("Please provide an email address.");
      await projectAuth.sendPasswordResetEmail(email);

      if (!isCancelled) {
        setResetPending(false);
        setError(null);
      }
      return { success: true };
    } catch (err) {
      if (!isCancelled) {
        setResetPending(false);
        setError(err.message);
      }
      throw err;
    }
  };

  useEffect(() => {
    return () => setIsCancelled(true);
  }, []);

  return {
    // auth actions
    login,
    Googlelogin,
    Facebooklogin,
    resetPassword,

    // loading / error states
    isPending,
    resetPending,
    error,

    // remember-me API
    remember,
    setRemember,
    rememberedEmail,
    updateRemember,
  };
};
