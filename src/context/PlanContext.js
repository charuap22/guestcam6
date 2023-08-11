import { createContext, useEffect, useReducer } from "react";
import { projectFirestore } from "../firebase/config";
import { useAuthContext } from "../hooks/useAuthContext";

export const PlanContext = createContext();

const planReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_PLAN":
      return { ...state, plan: action.payload };
    default:
      return state;
  }
};

export function PlanProvider({ children }) {
  //let p = "";
  let planDetails = {};
  const { user } = useAuthContext();
  useEffect(() => {
    if (user) {
      projectFirestore
        .collection("users")
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            if (doc.data().planId) {
              //changePlan(p);
              return projectFirestore
                .collection("plans")
                .doc(doc.data().planId)
                .get()
                .then((doc) => {
                  if (doc.exists) {
                    if (doc.data()) {
                      planDetails = doc.data();
                      console.log("plan from context", doc.data());
                      changePlan(planDetails);
                    }
                  }
                });
            }
          }
        });
    }
  }, [user]);

  const [state, dispatch] = useReducer(planReducer, { plan: planDetails });

  const changePlan = (plan) => {
    dispatch({ type: "CHANGE_PLAN", payload: plan });
  };
 
  return (
    <PlanContext.Provider value={{ ...state, changePlan }}>
      {children}
    </PlanContext.Provider>
  );
}
