import { EventContext } from "../context/EventContext";
import { useContext } from "react";

export const useEvent = () => {
  const context = useContext(EventContext);

  if (!context) {
    throw Error("useEvent must be used inside an EventContextProvider");
  }

  return context;
};
