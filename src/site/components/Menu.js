// src/components/header/Menu.jsx
import React from "react";
import { useHistory, NavLink } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useLogout } from "../../hooks/useLogout";
import { Spinner, useToast, Box } from "@chakra-ui/react";
import { useUserInfo } from "../../hooks/useUserInfo";

const Menu = () => {
  const { authIsReady, user } = useAuthContext();
  const { logout, isPending } = useLogout();
  const { UserInfo } = useUserInfo();
  const history = useHistory();
  const toast = useToast();

  // Quick, deterministic display name to avoid layout flicker:
  const computeDisplayName = () => {
    if (UserInfo?.displayName) return UserInfo.displayName;
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    return "Guest";
  };
  const displayNameLocal = computeDisplayName();

  // helper: decide if we should show a login link
  // show login when no user, or the user is anonymous, or role === 'guest'
  const shouldShowLogin =
    !user || user.isAnonymous || (UserInfo && UserInfo.role === "guest");

  const handleLogout = async () => {
    try {
      await logout();

      toast({
        title: "Signed out",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      // replace so back button doesn't return to a protected page
      history.replace("/login");
    } catch (err) {
      toast({
        title: "Sign out failed",
        description: err?.message || "Could not sign out. Try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      {/* <!-- ttm-header-wrap --> */}
      <div className="ttm-header-wrap">
        {/* <!-- ttm-stickable-header-w --> */}
        <div
          id="ttm-stickable-header-w"
          className="ttm-stickable-header-w clearfix"
        >
          <div id="site-header-menu" className="site-header-menu">
            <div className="site-header-menu-inner ttm-stickable-header">
              <div className="container">
                {/* <!-- site-branding --> */}
                <div className="site-branding">
                  <NavLink to="/">
                    <img
                      id="logo-img"
                      className="img-center"
                      src="/images/GuestPOV.svg"
                      alt="logo-img"
                    />
                  </NavLink>
                </div>
                {/* <!-- site-branding end --> */}

                {/* <!--site-navigation --> */}
                <div id="site-navigation" className="site-navigation">
                  <div className="ttm-menu-toggle">
                    <input type="checkbox" id="menu-toggle-form" />
                    <label
                      htmlFor="menu-toggle-form"
                      className="ttm-menu-toggle-block"
                    >
                      <span className="toggle-block toggle-blocks-1"></span>
                      <span className="toggle-block toggle-blocks-2"></span>
                      <span className="toggle-block toggle-blocks-3"></span>
                    </label>
                  </div>

                  <nav id="menu" className="menu">
                    <ul className="dropdown">
                      <li className="active">
                        <NavLink exact to="/" activeClassName="active">
                          Home
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/about">About Us</NavLink>
                      </li>
                      <li>
                        <NavLink to="/usecases">Events</NavLink>
                        <ul>
                          <li>
                            <a href="/usecases#wedding">Wedding</a>
                          </li>
                          <li>
                            <a href="/usecases#privateparty">Private Party</a>
                          </li>
                          <li>
                            <a href="/usecases#Corporate">Corporate Party</a>
                          </li>
                          <li>
                            <a href="/usecases#wedding">Birthdays</a>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <NavLink to="/howitworks">How it works?</NavLink>
                      </li>
                      <li>
                        <NavLink to="/pricing">Pricing</NavLink>
                      </li>

                      {/* Admin-only links */}
                      <li>
                        {!isPending && user && UserInfo?.role === "Admin" && (
                          <NavLink to="/admin/dashboard">Dashboard</NavLink>
                        )}
                      </li>
                      <li>
                        {!isPending && user && UserInfo?.role === "Admin" && (
                          // show a reserved space for the name to avoid jumps
                          <Box
                            as="span"
                            className="username"
                            style={{ minWidth: 120, display: "inline-block" }}
                          >
                            {displayNameLocal}
                            {!authIsReady && <Spinner size="xs" ml={2} />}
                          </Box>
                        )}
                      </li>

                      {/* ---------- Right-side actions (Login/Logout) ---------- */}
                      <li className="menu-right">
                        {/* If ADMIN is logged in → show Logout */}
                        {user && UserInfo?.role === "Admin" ? (
                          <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isPending}
                            aria-disabled={isPending}
                            aria-busy={isPending}
                            style={{
                              background: "transparent",
                              border: "none",
                              padding: 0,
                              cursor: isPending ? "default" : "pointer",
                              color: isPending ? "#888" : "inherit",
                              textDecoration: "underline",
                            }}
                          >
                            {isPending ? (
                              <>
                                <Spinner size="xs" mr={2} /> Signing out...
                              </>
                            ) : (
                              "Logout"
                            )}
                          </button>
                        ) : (
                          /* Otherwise show Login (visitors, guests, anonymous users) */
                          <NavLink to="/login">Login</NavLink>
                        )}
                      </li>
                    </ul>
                  </nav>
                </div>
                {/* <!-- site-navigation end--> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <!--ttm-header-wrap end --> */}
    </>
  );
};

export default Menu;
