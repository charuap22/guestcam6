import { useEffect, useRef, useState } from "react";
import { projectFirestore } from "../firebase/config";

const PAGE_SIZE = 12;

export function useGalleryPagination(eventId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const lastDocRef = useRef(null);

  const loadMore = async () => {
    if (!eventId || loading || done) return;

    setLoading(true);

    try {
      let query = projectFirestore
        .collection("gallery")
        .where("eventId", "==", eventId)
        .orderBy("createdAt", "desc")
        .limit(PAGE_SIZE);

      if (lastDocRef.current) {
        query = query.startAfter(lastDocRef.current);
      }

      const snap = await query.get();

      const newItems = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (snap.docs.length < PAGE_SIZE) setDone(true);
      lastDocRef.current = snap.docs[snap.docs.length - 1] || null;

      setItems((prev) => [...prev, ...newItems]);
    } catch (e) {
      console.error("Gallery pagination error:", e);
    } finally {
      setLoading(false);
    }
  };

  /** ✅ ADD THIS BACK */
  const prependItem = (item) => {
    setItems((prev) => [item, ...prev]);
  };

  useEffect(() => {
    setItems([]);
    setDone(false);
    lastDocRef.current = null;

    if (eventId) loadMore();
    // eslint-disable-next-line
  }, [eventId]);

  return {
    items,
    loadMore,
    loading,
    done,
    prependItem, // ✅ RETURN IT
  };
}
