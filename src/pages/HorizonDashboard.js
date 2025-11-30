// src/pages/HorizonDashboard.js
import React, { useState } from "react";
import {
  Portal,
  Box,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";
import Footer from "../components/footer/FooterAdmin";
import Navbar from "../components/navbar/NavbarAdmin";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";
import routes from "../routes";
import { useAuthContext } from "../hooks/useAuthContext";
import { useDocument } from "../hooks/useDocument";

export default function HorizonDashboard(props) {
  const { ...rest } = props;
  const [fixed] = useState(false);
  const { onOpen } = useDisclosure();
  const location = useLocation();

  // --- Auth and user data ---
  const { user } = useAuthContext();
  const { document: userDoc } = useDocument("users", user?.uid);

  // --- User type detection ---
  const hasPackage =
    Boolean(userDoc?.packageActive) ||
    Boolean(userDoc?.hasPurchased) ||
    Boolean(userDoc?.subscriptionActive) ||
    Boolean(userDoc?.package?.active);

  const isGuest = !user || user.isAnonymous || userDoc?.role === "guest";

  // --- Guest route detection (optional, for layout differences) ---
  const guestPatterns = [
    "/admin/guest-dashboard",
    "/admin/gallery/guest",
    "/admin/videos/guest",
    "/admin/guestbook/guest",
  ];

  const pathname = location.pathname || "";
  const isGuestRoute = guestPatterns.some((p) => pathname.includes(p));

  // --- Route builder ---
  const getRoutes = (routesArray) =>
    routesArray.map((route, key) => {
      if (route.layout === "/admin") {
        return (
          <Route
            exact
            path={route.layout + (route.path || "")}
            key={key}
            render={() => route.component}
          />
        );
      }
      return null;
    });

  return (
    <Box>
      {/* ✅ Sidebar fully removed — page now spans 100% width */}
      <Box
        minHeight="100vh"
        height="100%"
        overflow="auto"
        position="relative"
        w="100%"
        transition="all 0.3s ease"
      >
        <Portal>
          <Navbar
            onOpen={onOpen}
            logoText="GUESTPOV"
            brandText="Dashboard"
            fixed={fixed}
            {...rest}
          />
        </Portal>

        {/* Page content */}
        <Box mx="0" pt="50px">
          <Switch>
            {getRoutes(routes)}
            <Redirect exact from="/admin" to="/admin/dashboard" />
          </Switch>
        </Box>

        {/* <Footer /> */}
      </Box>
    </Box>
  );
}
