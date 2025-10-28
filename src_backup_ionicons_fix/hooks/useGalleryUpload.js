import { useState, useEffect } from "react";
import {
  projectStorage,
  projectFirestore,
  timestamp,
} from "../firebase/config";
import { useAuthContext } from "../hooks/useAuthContext";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";
import { useEvent } from "./useEvent";
//import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
const useGalleryUpload = (file, user, fileType) => {
  //this will be guest user or admin
  //
  const { eventId } = useEvent();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    //     // references
    const imageName = uuidv4() + "." + file.name.split(".").pop();
    //const uploadPath = `gallery/${eventId}/${imageName}`;
    const uploadPath = `${fileType}/${eventId}/${imageName}`;
    const storageRef = projectStorage.ref(uploadPath);
    const collectionRef = projectFirestore.collection(fileType);

    // uploadBytesResumable(storageRef, file).on(
    storageRef.put(file).on(
      "state_changed",
      (snap) => {
        let percentage = (snap.bytesTransferred / snap.totalBytes) * 100;
        setProgress(Math.trunc(percentage));
        console.log(percentage);
      },
      (err) => {
        setError(err);
      },

      async () => {
        const url = await storageRef.getDownloadURL();
        const createdAt = timestamp.fromDate(new Date());
        const createdBy = user.uid;
        const createdByName = user.displayName;
        await collectionRef.add({
          url,
          createdAt,
          createdBy,
          createdByName,
          eventId,
        });
        setUrl(url);
      }
    );
  }, [file, eventId]);

  return { progress, url, error };
};

export default useGalleryUpload;
