// src/routes/AdminGuard.jsx
import { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useUserInfo } from "../hooks/useUserInfo";
import { usePlan } from "../context/PlanContext";
import firebase from "firebase/app";
import "firebase/firestore";

export default function AdminGuard({ children }) {
  const history = useHistory();
  const location = useLocation();

  const { user, authIsReady } = useAuthContext();
  const { UserInfo } = useUserInfo();
  const { currentPlan, loading: planLoading } = usePlan();

  const isLoading = !authIsReady || UserInfo === undefined || planLoading;

  useEffect(() => {
    if (isLoading) return;

    // 🔒 Not logged in → login
    if (!user) {
      history.replace(`/login?redirect=${location.pathname}`);
      return;
    }

    // ✅ ALLOW GUESTS / ANONYMOUS USERS (DO NOTHING)
 const isGuest = user.isAnonymous || UserInfo?.role === "guest";
 const isGuestRoute = location.pathname.includes("/guest-");

 if (isGuest && !isGuestRoute) {
   firebase
     .firestore()
     .collection("guests")
     .doc(user.uid)
     .get()
     .then((snap) => {
       if (snap.exists && snap.data()?.eventId) {
         history.replace(`/admin/guest-dashboard/${snap.data().eventId}`);
       } else {
         history.replace("/guest-login");
       }
     });
   return;
 }


    // 🔒 OWNER WITHOUT PLAN → PRICING
    if (!currentPlan) {
      history.replace("/pricing");
    }
  }, [user, UserInfo, currentPlan, isLoading, history, location.pathname]);

  if (isLoading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // 🚫 Block render ONLY for owners without plan
  if (!currentPlan && !user?.isAnonymous && UserInfo?.role !== "guest") {
    return null;
  }

  return children;
}
