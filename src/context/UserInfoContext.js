// src/context/UserInfoContext.js
import { createContext, useEffect, useReducer } from "react";
import { projectFirestore } from "../firebase/config";
import { useAuthContext } from "../hooks/useAuthContext";

export const UserInfoContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case "SET":
      return { UserInfo: action.payload };
    case "CLEAR":
      return { UserInfo: null };
    default:
      return state;
  }
};

export function UserInfoProvider({ children }) {
  const { user } = useAuthContext();
  const [state, dispatch] = useReducer(reducer, { UserInfo: null });

  useEffect(() => {
    if (!user) {
      dispatch({ type: "CLEAR" });
      return;
    }

    const unsub = projectFirestore
      .collection("users")
      .doc(user.uid)
      .onSnapshot((doc) => {
        if (!doc.exists) {
          dispatch({ type: "CLEAR" });
          return;
        }

        dispatch({
          type: "SET",
          payload: { ...doc.data(), uid: user.uid },
        });
      });

    return () => unsub();
  }, [user]);

  return (
    <UserInfoContext.Provider value={state}>
      {children}
    </UserInfoContext.Provider>
  );
}
