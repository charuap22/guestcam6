import { useEffect, useState } from "react";
import { projectFirestore } from "../firebase/config";

export const useDocument = (collection, id) => {
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    // ✅ if id or collection is missing, skip Firestore call
    if (!collection || !id) {
      setDocument(null);
      setIsPending(false);
      setError(null);
      return;
    }

    setIsPending(true);

    try {
      const ref = projectFirestore.collection(collection).doc(id);

      const unsubscribe = ref.onSnapshot(
        (snapshot) => {
          if (snapshot.exists) {
            setDocument({ ...snapshot.data(), id: snapshot.id });
            setError(null);
          } else {
            setDocument(null);
            setError("No such document exists");
          }
          setIsPending(false);
        },
        (err) => {
          console.error("useDocument error:", err.message);
          setError("Failed to get document");
          setIsPending(false);
        }
      );

      // cleanup
      return () => unsubscribe();
    } catch (err) {
      console.error("Invalid Firestore reference:", err);
      setError("Invalid document reference");
      setIsPending(false);
    }
  }, [collection, id]);

  return { document, error, isPending };
};
