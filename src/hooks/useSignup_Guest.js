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

export const useSignup_Guest = () => {
  const [IsActive, setIsActive] = useState(true);
  const [error, setError] = useState(null);

  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();

  let history = useHistory();
  const signup = async (displayName, thumbnail, eventId) => {
    setError(null);
    setIsPending(true);

    try {
      // signup
      const res = await projectAuth.signInAnonymously();

      if (!res) {
        throw new Error("Could not complete signup");
      }

      let photoURL = "";
      // upload user thumbnail
      if (thumbnail) {
        const uploadPath = `thumbnails/${res.user.uid}/${thumbnail.name}`;
        const img = await projectStorage.ref(uploadPath).put(thumbnail);
        const imgUrl = await img.ref.getDownloadURL();
        photoURL = imgUrl;
      }
      
      // add display name AND PHOTO_URL  to user
      await res.user.updateProfile({ displayName, photoURL: photoURL });
      //create user document
      await projectFirestore.collection("users").doc(res.user.uid).set({
        online: true,
        displayName,
        photoURL: photoURL,
        planId: "",
        role: "Guest",
      });
      // dispatch login action
      dispatch({
        type: "LOGIN",
        payload: res.user
      });
      history.push(`/Guest/Dashboard/${eventId}`);
      if (IsActive) {
        setIsPending(false);
        setError(null);
        // toast.success("Success!", {
        //   position: "top-right",
        //   autoClose: 2000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,
        //   theme: "colored",
        // });
      }
    } catch (err) {
      if (IsActive) {
        setError(err.message);
        setIsPending(false);
      }
    }
  };

  useEffect(() => {
    setIsActive(true);
    return () => setIsActive(false);
  }, []);

  return { signup, error, isPending };
};
