// src/pages/HorizonDashboard.js
import React, { useState } from "react";
import { Portal, Box, useDisclosure } from "@chakra-ui/react";
import Navbar from "../components/navbar/NavbarAdmin";
import { Switch, Route, Redirect } from "react-router-dom";
import routes from "../routes";
import { useAuthContext } from "../hooks/useAuthContext";
import { useDocument } from "../hooks/useDocument";

export default function HorizonDashboard(props) {
  const { ...rest } = props;

  const [fixed] = useState(false);
  const { onOpen } = useDisclosure();

  // --- Auth + user document ---
  const { user } = useAuthContext();
  const { document: userDoc } = useDocument("users", user?.uid);

  // --- Route builder (FIXED) ---
  const getRoutes = (routesArray) =>
    routesArray.map((route, key) => {
      if (route.layout === "/admin") {
        return (
          <Route
            exact
            path={route.layout + (route.path || "")}
            key={key}
            render={(props) => <route.component {...props} />}
          />
        );
      }
      return null;
    });

  return (
    <Box>
      {/* Layout wrapper */}
      <Box
        minH="100vh"
        w="100%"
        position="relative"
        overflow="auto"
        transition="all 0.3s ease"
      >
        {/* Navbar */}
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
      </Box>
    </Box>
  );
}
