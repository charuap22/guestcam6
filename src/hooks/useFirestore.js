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
    case "ERROR":
      return {
        isPending: false,
        document: null,
        success: false,
        error: action.payload,
      };
    case "UPDATED_DOCUMENT":
      return {
        isPending: false,
        document: action.payload,
        success: true,
        error: null,
      };
    default:
      return state;
  }
};

export const useFirestore = (collection) => {
  const [response, dispatch] = useReducer(firestoreReducer, initialState);
  const [isCancelled, setIsCancelled] = useState(false);

  // collection ref
  const ref = projectFirestore.collection(collection);

  // only dispatch if not cancelled
  const dispatchIfNotCancelled = (action) => {
    if (!isCancelled) {
      dispatch(action);
    }
  };

  // add a document
  const addDocument = async (doc) => {
    dispatch({ type: "IS_PENDING" });

    try {
      const createdAt = timestamp.fromDate(new Date());
      const addedDocument = await ref.add({ ...doc, createdAt });
      dispatchIfNotCancelled({
        type: "ADDED_DOCUMENT",
        payload: addedDocument,
      });
    } catch (err) {
      dispatchIfNotCancelled({ type: "ERROR", payload: err.message });
    }
  };

  // delete a document
  const deleteDocument = async (id) => {
    dispatch({ type: "IS_PENDING" });

    try {
      await ref.doc(id).delete();
      dispatchIfNotCancelled({ type: "DELETED_DOCUMENT" });
    } catch (err) {
      dispatchIfNotCancelled({ type: "ERROR", payload: "could not delete" });
    }
  };

  // update a document
  const updateDocument = async (id, updates) => {
    dispatch({ type: "IS_PENDING" });

    try {
      const updatedDocument = await ref.doc(id).update(updates);
      dispatchIfNotCancelled({
        type: "UPDATED_DOCUMENT",
        payload: updatedDocument,
      });
      return updatedDocument;
    } catch (error) {
      dispatchIfNotCancelled({ type: "ERROR", payload: error });
      return null;
    }
  };

  // delete a comment
  const deleteComment = async (eventId, id) => {
    dispatch({ type: "IS_PENDING" });
    try {
      // fetch the "kids" document
      let docRef = projectFirestore.collection("events").doc(eventId);
      let docSnap = await docRef.get();
      let docData = docSnap.data();

      // remove the element that we no longer want in the document
      docData.guestBook[id].delete();

      // update the document in Firestore
      await docRef.update(docData);
      console.log(`Document updated with ${id} removed!`, docData);
    } catch (ex) {
      console.error(`EXCEPTION while removing ${id}:`, ex);
    }

    //  projectFirestore
    //   .collection("events")
    //   .doc(eventId)
    //   .collection("guestBook")
    //   .doc(id)
    //   .get()
    //   .subscribe((data) => {
    //     data.ref.delete().then(
    //       () => {
    //         console.log("success");
    //          dispatchIfNotCancelled({ type: "DELETED_DOCUMENT" });
    //       },
    //       (error) => {
    //         console.log("error", error);
    //         dispatchIfNotCancelled({ type: "ERROR", payload: "could not delete" });
    //       }
    //     );
    //   });
  };

  useEffect(() => {
    return () => setIsCancelled(true);
  }, []);

  return {
    addDocument,
    deleteDocument,
    updateDocument,
    deleteComment,
    response,
  };
};
