import { createContext, useReducer, useCallback, useMemo } from "react";

export const EventContext = createContext();

const eventReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_EVENT":
      return { ...state, eventId: action.payload };
    default:
      return state;
  }
};

export function EventProvider({ children }) {
  const [state, dispatch] = useReducer(eventReducer, { eventId: "" });

  // ✅ Memoize to prevent function identity changes
  const changeEvent = useCallback((eventId) => {
    dispatch({ type: "CHANGE_EVENT", payload: eventId });
  }, []);

  // ✅ Memoize the provided value so React doesn't re-render all consumers unnecessarily
  const value = useMemo(
    () => ({
      ...state,
      changeEvent,
    }),
    [state, changeEvent]
  );

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
}
