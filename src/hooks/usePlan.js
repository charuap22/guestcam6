import { useContext } from "react";
import { PlanContext } from "../context/PlanContext";

export const usePlan = () => {
  const context = useContext(PlanContext);

  if (context === undefined) {
    throw new Error("usePlan() must be used inside a PlanProvider");
  }

  return context;
};
