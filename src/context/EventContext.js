import { createContext, useReducer } from "react";

export const EventContext = createContext();

const eventReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_EVENT":
      return { ...state, eventId: action.payload };
    default:
      return state;
  }
};

//

export function EventProvider({ children }) {
  //useReducer(eventReducer, { eventId: "" });
  const [state, dispatch] = useReducer(eventReducer, { eventId: "" });
  
  const changeEvent = (eventId) => {
    dispatch({ type: "CHANGE_EVENT", payload: eventId });
  };
  
  return (
    <EventContext.Provider value={{ ...state,changeEvent }}>
      {children}
    </EventContext.Provider>
  );
}
