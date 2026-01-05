// src/routes/RouteGuard.jsx
import { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useUserInfo } from "../hooks/useUserInfo";
import { usePlan } from "../context/PlanContext";

export default function RouteGuard({ children, access }) {
  const history = useHistory();
  const location = useLocation();

  const { user, authIsReady } = useAuthContext();
  const { UserInfo } = useUserInfo();
  const { currentPlan, loading: planLoading } = usePlan();

  // ✅ WAIT FOR EVERYTHING
  const isLoading =
    !authIsReady ||
    UserInfo === undefined ||
    planLoading ||
    currentPlan === undefined;

  useEffect(() => {
    if (isLoading) return;

    // 🔒 Not logged in
    if (!user) {
      history.replace(`/login?redirect=${location.pathname}`);
      return;
    }

    // 🚫 Block anonymous users
    if (user.isAnonymous) {
      history.replace("/login");
      return;
    }

    // 🚫 Guest accessing owner route
    if (access === "owner" && UserInfo?.role === "guest") {
      history.replace(`/admin/guest-dashboard/${UserInfo?.eventId || ""}`);
      return;
    }

    // 🚫 Owner WITHOUT plan → pricing
    // ⚠️ THIS IS THE KEY FIX
    if (access === "owner" && currentPlan === null) {
      history.replace("/pricing");
      return;
    }
  }, [
    isLoading,
    user,
    UserInfo,
    currentPlan,
    access,
    history,
    location.pathname,
  ]);

  if (isLoading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" />
      </Center>
    );
  }
  console.log("PLAN STATE", {
    plan: currentPlan,
    loading: planLoading,
  });

  return children;
}
