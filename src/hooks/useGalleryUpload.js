// src/hooks/useGalleryUpload.js
import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  projectStorage,
  projectFirestore,
  timestamp,
} from "../firebase/config";

/**
 * useGalleryUpload(file, user, fileType = 'gallery', eventId = null)
 * - file: File object to upload
 * - user: firebase user object (must have uid)
 * - fileType: 'gallery' or 'videos' (controls collection/folder)
 * - eventId: id of the event (required)
 *
 * Returns: { progress, url, error }
 */
export default function useGalleryUpload(
  file,
  user,
  fileType = "gallery",
  eventId = null
) {
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);
  const uploadTaskRef = useRef(null);

  useEffect(() => {
    if (!file) return;
    if (!user || !user.uid) {
      setError(new Error("User must be authenticated to upload."));
      return;
    }
    if (!eventId) {
      setError(new Error("eventId is required for upload."));
      return;
    }

    const fileId = uuidv4();
    const folder = fileType === "videos" ? "videos" : "gallery";
    const storagePath = `${folder}/${eventId}/${fileId}`;

    try {
      // storage reference from your exported projectStorage
      const storageRef = projectStorage.ref(storagePath);

      // metadata so you can enforce rules based on customMetadata.userId etc.
      const metadata = {
        contentType: file.type,
        customMetadata: {
          userId: user.uid,
          eventId,
        },
      };

      // start upload (namespaced v6 API)
      const uploadTask = storageRef.put(file, metadata);
      uploadTaskRef.current = uploadTask;

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(pct));
        },
        (err) => {
          console.error("Upload error:", err);
          setError(err);
        },
        async () => {
          try {
            // get the download URL
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();

            // compute uploader name with safe fallbacks
            const uploaderName =
              (user &&
                (user.displayName ||
                  (user.email && user.email.split("@")[0]) ||
                  (user.isAnonymous ? "Guest" : null))) ||
              "Guest";

            // prepare Firestore document
            const docData = {
              eventId,
              url: downloadURL,
              userId: user.uid, // legacy field (keeps previous naming)
              uploaderUid: user.uid, // explicit reliable field
              uploaderName, // explicit reliable field
              createdByName: uploaderName, // keep for backward compatibility
              filename: file.name,
              createdAt: timestamp
                ? timestamp.fromDate(new Date())
                : new Date(),
              storagePath,
              fileType,
            };

            // add to collection via exported projectFirestore
            await projectFirestore.collection(folder).add(docData);

            setUrl(downloadURL);
          } catch (err2) {
            console.error("Firestore write error:", err2);
            setError(err2);
          }
        }
      );
    } catch (ex) {
      console.error("Upload init error:", ex);
      setError(ex);
    }

    // cleanup if component unmounts
    return () => {
      if (uploadTaskRef.current && uploadTaskRef.current.cancel) {
        try {
          uploadTaskRef.current.cancel();
        } catch (e) {
          // ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return { progress, url, error };
}
