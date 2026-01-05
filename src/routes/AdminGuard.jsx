import { Redirect, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePlan } from "../context/PlanContext";
import { Center, Spinner } from "@chakra-ui/react";

export default function AdminGuard({ children }) {
  const location = useLocation();
  const { user, authIsReady } = useAuthContext();
  const { currentPlan, loading } = usePlan();

  // ⛔ BLOCK ALL RENDERING UNTIL READY
  if (!authIsReady || loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // 🔒 Not logged in
  if (!user) {
    return (
      <Redirect
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
      />
    );
  }

  // 🚫 Logged in but no plan
  if (!currentPlan) {
    return <Redirect to="/pricing" />;
  }

  // ✅ Authorized
  return children;
}
