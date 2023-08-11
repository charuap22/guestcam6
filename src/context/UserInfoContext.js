import { createContext, useEffect, useReducer } from "react";
import { projectFirestore } from "../firebase/config";
import { useAuthContext } from "../hooks/useAuthContext";

export const UserInfoContext = createContext();

const UserInfoReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_USERINFO":
      return { ...state, UserInfo: action.payload };
    default:
      return state;
  }
};

export function UserInfoProvider({ children }) {
  //let p = "";
  let UserInfoDetails = {};
  const { user } = useAuthContext();
  useEffect(() => {
    if (user) {
      projectFirestore
        .collection("users")
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
             if (doc.data()) {
               UserInfoDetails = doc.data();
               console.log("UserInfo from context", doc.data());
               changeUserInfo(UserInfoDetails);
             }
          }
        });
    }
  }, [user]);

  const [state, dispatch] = useReducer(UserInfoReducer, { UserInfo: UserInfoDetails });

  const changeUserInfo = (UserInfo) => {
    dispatch({ type: "CHANGE_USERINFO", payload: UserInfo });
  };

  return (
    <UserInfoContext.Provider value={{ ...state, changeUserInfo }}>
      {children}
    </UserInfoContext.Provider>
  );
}
