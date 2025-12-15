import { useState, useEffect } from "react";
import {
  projectAuth,
  projectStorage,
  projectFirestore,
} from "../firebase/config";
import { useAuthContext } from "./useAuthContext";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export const useSignup_Guest = () => {
  
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();
  const history = useHistory();

  const signup = async (displayName, thumbnail, eventId) => {
    setError(null);
    setIsPending(true);
console.log("GUEST LOGIN REDIRECT TO:", `/admin/guest-dashboard/${eventId}`);

    try {
      // ✅ Step 1: Sign in anonymously
      const res = await projectAuth.signInAnonymously();
      if (!res) throw new Error("Could not complete signup");

      let photoURL = "";
      // ✅ Step 2: Upload user thumbnail if provided
      if (thumbnail) {
        const uploadPath = `thumbnails/${res.user.uid}/${thumbnail.name}`;
        const img = await projectStorage.ref(uploadPath).put(thumbnail);
        photoURL = await img.ref.getDownloadURL();
      }

      // ✅ Step 3: Update Firebase auth profile
      await res.user.updateProfile({ displayName, photoURL });

      // ✅ Step 4: Save guest details to Firestore
      await projectFirestore.collection("guests").doc(res.user.uid).set(
        {
          online: true,
          displayName,
          photoURL,
          eventId, // ✅ Assign event to the guest
        },
        { merge: true } // ✅ Prevent overwriting existing data
      );

      // ✅ Step 5: Dispatch login action
      dispatch({ type: "LOGIN", payload: res.user });

      // ✅ Step 6: Redirect to Guest Dashboard
      history.push(`/admin/guest-dashboard/${eventId}`);

      if (isActive) {
        setIsPending(false);
        setError(null);
        toast.success("Guest login successful!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    } catch (err) {
      if (isActive) {
        setError(err.message);
        setIsPending(false);
        toast.error(`Error: ${err.message}`, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    }
  };

  useEffect(() => {
    setIsActive(true);
    return () => setIsActive(false);
  }, []);

  return { signup, error, isPending };
};
