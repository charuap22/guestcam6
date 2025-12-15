import { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useUserInfo } from "../hooks/useUserInfo";
import { usePlan } from "../context/PlanContext";

export default function AdminGuard({ children }) {
  const history = useHistory();
  const location = useLocation();

  const { user, authIsReady } = useAuthContext();
  const { UserInfo } = useUserInfo();
  const { currentPlan, loading: planLoading } = usePlan();

  const isLoading = !authIsReady || UserInfo === undefined || planLoading;

  useEffect(() => {
    if (isLoading) return;

    // 🔴 Not logged in
    if (!user) {
      history.replace(`/login?redirect=${location.pathname}`);
      return;
    }

    // 🔴 Guests blocked from admin
    if (user.isAnonymous || UserInfo?.role === "guest") {
      history.replace("/guest-dashboard");
      return;
    }

    // 🔴 OWNER WITHOUT PLAN → FORCE PRICING
    if (!currentPlan) {
      history.replace("/pricing");
      return;
    }
  }, [user, UserInfo, currentPlan, isLoading, history, location.pathname]);

  if (isLoading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // 🚫 Block render if plan missing
  if (!currentPlan) {
    return null;
  }

  return children;
}
