// src/routes/PlanGuard.js
import { usePlan } from "../context/PlanContext";
import { Redirect } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";

export default function PlanGuard({ children }) {
  const { currentPlan, loading } = usePlan();

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (currentPlan) {
    return <Redirect to="/admin/dashboard" />;
  }

  return children;
}
