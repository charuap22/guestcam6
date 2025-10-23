// src/hooks/useCollection.js
import { useEffect, useState, useRef } from "react";
import { projectFirestore } from "../firebase/config";

export const useCollection = (collection, _query, _orderBy) => {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  // keep stable references so effect doesn't re-run because arrays are recreated
  const query = useRef(_query).current;
  const orderBy = useRef(_orderBy).current;

  useEffect(() => {
    // If no collection or no valid query (we call hook unconditionally from component),
    // we just return empty state rather than attempting an invalid Firestore query.
    if (!collection) {
      setDocuments([]);
      setIsPending(false);
      setError(null);
      return;
    }

    let ref = projectFirestore.collection(collection);

    // If a query was passed as an array like ["eventId", "==", id]
    if (query && Array.isArray(query) && query.length === 3) {
      // guard: don't run a where if the value (3rd item) is undefined/null
      const value = query[2];
      if (value === undefined || value === null) {
        // no valid filter value yet — return empty results until value exists
        setDocuments([]);
        setIsPending(false);
        setError(null);
        return;
      }
      ref = ref.where(...query);
    }

    if (orderBy && Array.isArray(orderBy) && orderBy.length >= 1) {
      ref = ref.orderBy(...orderBy);
    }

    setIsPending(true);

    const unsubscribe = ref.onSnapshot(
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDocuments(results);
        setIsPending(false);
        setError(null);
      },
      (err) => {
        // Surface the real error so debugging is possible
        console.error("useCollection onSnapshot error:", err);
        // If Firestore tells us index is required, include message (console link is clickable)
        if (
          err?.code === "failed-precondition" &&
          err.message?.includes("index")
        ) {
          setError("Firestore index required: " + err.message);
        } else if (
          err?.code === "permission-denied" ||
          (err.message &&
            err.message.includes("Missing or insufficient permissions"))
        ) {
          setError("Permission error: " + err.message);
        } else {
          setError(err.message || "could not fetch the data");
        }
        setIsPending(false);
      }
    );

    return () => unsubscribe();
  }, [collection, query, orderBy]);

  return { documents, error, isPending };
};
