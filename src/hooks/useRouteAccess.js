import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "./useAuthContext";
import { useUserInfo } from "./useUserInfo";

export function useRouteAccess() {
  const location = useLocation();
  const { user, authIsReady } = useAuthContext();
  const { UserInfo } = useUserInfo();

  return useMemo(() => {
    const path = location.pathname;

    const isReady = authIsReady && UserInfo !== undefined;
    const isAnonymous = !!user?.isAnonymous;
    const role = UserInfo?.role || "anonymous";

    const isGuestRoute =
      path.includes("/guest-dashboard") ||
      path.includes("/gallery/guest") ||
      path.includes("/videos/guest") ||
      path.includes("/guestbook/guest");

    const isOwnerRoute =
      path.includes("/dashboard") ||
      path.includes("/events") ||
      path.includes("/gallery/owner") ||
      path.includes("/videos/owner") ||
      path.includes("/guestbook/owner") ||
      path.includes("/create-event") ||
      path.includes("/edit-event");

    return {
      isReady,
      role,
      isAnonymous,
      isGuestRoute,
      isOwnerRoute,
      showOwnerNavbar: isReady && role === "owner" && !isAnonymous,
      showGuestNavbar: isReady && (role === "guest" || isAnonymous),
    };
  }, [location.pathname, user, authIsReady, UserInfo]);
}
