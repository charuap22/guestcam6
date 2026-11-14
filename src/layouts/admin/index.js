// src/layouts/admin/index.js
import React, { Suspense } from "react";
import { Box, Spinner } from "@chakra-ui/react";
import { Route, Switch, Redirect } from "react-router-dom";

import Footer from "../../components/footer/FooterAdmin";
import OwnerNavbar from "../../components/navbar/OwnerNavbar";
import GuestNavbar from "../../components/navbar/GuestNavbar";

import { useRouteAccess } from "../../hooks/useRouteAccess";
import RouteGuard from "../../routes/RouteGuard";
import HorizonWrapper from "../../components/HorizonWrapper";

import routes from "../../routes";

export default function AdminLayout(props) {
  console.log("🏗 AdminLayout rendered");

  const { showOwnerNavbar, showGuestNavbar } = useRouteAccess();

  const getRoutes = (routesArray) =>
    routesArray.map((route, key) => {
      if (route.layout !== "/admin") return null;

      const Page = route.component;

      return (
        <Route
          key={key}
          exact
          path={route.layout + route.path}
          render={(routeProps) => (
            <Suspense fallback={<Spinner size="xl" />}>
              <RouteGuard access={route.access}>
                <Page {...routeProps} />
              </RouteGuard>
            </Suspense>
          )}
        />
      );
    });

  return (
    <Box minH="100vh">
      {/* ✅ NAVBAR (never in Portal, never in wrapper) */}
      {showGuestNavbar ? (
        <GuestNavbar {...props} />
      ) : (
        <OwnerNavbar {...props} />
      )}

      {/* ✅ CONTENT */}
      <HorizonWrapper>
        <Box
          pt={{ base: "80px", md: "92px" }}
           minH={{ base: "100vh", md: "calc(100vh - 92px)" }}
          w="100%"
          maxW="100vw"
          overflowX="hidden"
        >
          <Switch>
            {getRoutes(routes)}
            <Redirect from="/admin" to="/admin/dashboard" />
          </Switch>
        </Box>
      </HorizonWrapper>

      <Footer />
    </Box>
  );
}
