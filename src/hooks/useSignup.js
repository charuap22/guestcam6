import { useState, useEffect } from "react";
import {
  projectAuth,
  projectStorage,
  projectFirestore,
} from "../firebase/config";
import { useAuthContext } from "./useAuthContext";
import { ToastContainer, toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

export const useSignup = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const { dispatch } = useAuthContext();

  const signup = async (email, password, displayName, thumbnail) => {
    setError(null);
    setIsPending(true);

    try {
      const res = await projectAuth.createUserWithEmailAndPassword(
        email,
        password
      );

      if (!res) throw new Error("Signup failed");

      let photoURL = "";
      if (thumbnail) {
        const uploadPath = `thumbnails/${res.user.uid}/${thumbnail.name}`;
        const img = await projectStorage.ref(uploadPath).put(thumbnail);
        photoURL = await img.ref.getDownloadURL();
      }

      await res.user.updateProfile({ displayName, photoURL });
await res.user.reload(); // 🔥 important
dispatch({ type: "LOGIN", payload: res.user });

      // ✅ CLEAN USER DOC
     await projectFirestore.collection("users").doc(res.user.uid).set({
       email,
       online: true,
       displayName,
       photoURL,
       role: "owner", // ✅ canonical role
       planId: null, // ✅ MUST be null
       subscriptionStatus: null,
       subscribedOn: null,
       demo: false,
     });

      dispatch({ type: "LOGIN", payload: res.user });
      setIsPending(false);
    } catch (err) {
      setError(err.message);
      setIsPending(false);
    }
  };

  return { signup, error, isPending };
};

