import { useReducer, useEffect, useState } from "react";
import { projectFirestore, timestamp } from "../firebase/config";

let initialState = {
  document: null,
  isPending: false,
  error: null,
  success: null,
};

const firestoreReducer = (state, action) => {
  switch (action.type) {
    case "IS_PENDING":
      return { isPending: true, document: null, success: false, error: null };
    case "ADDED_DOCUMENT":
      return {
        isPending: false,
        document: action.payload,
        success: true,
        error: null,
      };
    case "DELETED_DOCUMENT":
      return { isPending: false, document: null, success: true, error: null };
    case "UPDATED_DOCUMENT":
      return {
        isPending: false,
        document: action.payload,
        success: true,
        error: null,
      };
    case "ERROR":
      return {
        isPending: false,
        document: null,
        success: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export const useFirestore = (collection) => {
  const [response, dispatch] = useReducer(firestoreReducer, initialState);
  const [isCancelled, setIsCancelled] = useState(false);

  // Firestore collection reference
  const ref = projectFirestore.collection(collection);

  // Only dispatch if the component is still active
  const dispatchIfNotCancelled = (action) => {
    if (!isCancelled) {
      dispatch(action);
    }
  };

  // **✅ Improved Add Document**
  const addDocument = async (doc) => {
    dispatch({ type: "IS_PENDING" });

    try {
      const createdAt = timestamp.fromDate(new Date());
      const addedDocumentRef = await ref.add({ ...doc, createdAt }); // Firestore reference

      const addedDocument = { id: addedDocumentRef.id, ...doc, createdAt }; // ✅ Return ID & Data

      // 🔹 Log the saved document to verify all fields
      const snap = await addedDocumentRef.get();
      console.log("Saved in Firestore:", snap.data());
      
      dispatchIfNotCancelled({
        type: "ADDED_DOCUMENT",
        payload: addedDocument,
      });

      return {
        id: addedDocumentRef.id,
        success: true,
        document: addedDocumentRef,
      }; // ✅ Ensure full reference is returned
    } catch (err) {
      dispatchIfNotCancelled({ type: "ERROR", payload: err.message });
      return { error: err.message }; // ✅ Handle errors
    }
  };

  // **✅ Improved Update Document**
  const updateDocument = async (id, updates) => {
    dispatch({ type: "IS_PENDING" });

    try {
      const documentRef = ref.doc(id);
      await documentRef.update(updates);

      // ✅ Fetch the updated document after update
      const updatedDocumentSnap = await documentRef.get();
      const updatedDocument = {
        id: updatedDocumentSnap.id,
        ...updatedDocumentSnap.data(),
      };

      dispatchIfNotCancelled({
        type: "UPDATED_DOCUMENT",
        payload: updatedDocument,
      });

      return updatedDocument;
    } catch (error) {
      dispatchIfNotCancelled({ type: "ERROR", payload: error.message });
      return null;
    }
  };

  // **✅ Improved Delete Document**
  const deleteDocument = async (id) => {
    dispatch({ type: "IS_PENDING" });

    try {
      await ref.doc(id).delete();
      dispatchIfNotCancelled({ type: "DELETED_DOCUMENT" });
      return { success: true };
    } catch (err) {
      dispatchIfNotCancelled({ type: "ERROR", payload: err.message });
      return { error: err.message };
    }
  };

  // **✅ Improved Delete Comment**
  const deleteComment = async (eventId, commentId) => {
    dispatch({ type: "IS_PENDING" });

    try {
      const eventRef = projectFirestore.collection("events").doc(eventId);
      const eventSnap = await eventRef.get();

      if (!eventSnap.exists) {
        throw new Error("Event not found");
      }

      const eventData = eventSnap.data();
      const guestBook = eventData.guestBook || [];

      // **✅ Remove the comment safely**
      const updatedGuestBook = guestBook.filter(
        (comment) => comment.id !== commentId
      );

      await eventRef.update({ guestBook: updatedGuestBook });

      console.log(`✅ Comment ${commentId} removed successfully.`);
      dispatchIfNotCancelled({
        type: "UPDATED_DOCUMENT",
        payload: { guestBook: updatedGuestBook },
      });

      return { success: true };
    } catch (err) {
      console.error("❌ Error removing comment:", err.message);
      dispatchIfNotCancelled({ type: "ERROR", payload: err.message });
      return { error: err.message };
    }
  };

  useEffect(() => {
    return () => setIsCancelled(true);
  }, []);

  return {
    addDocument,
    updateDocument,
    deleteDocument,
    deleteComment,
    response,
  };
};
