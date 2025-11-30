// src/layouts/admin/index.js
import React, { useState } from "react";
// Chakra imports
import {
  Portal,
  Box,
  useDisclosure,
  Flex,
  Spinner,
  Text,
  ChakraProvider,
} from "@chakra-ui/react";

import Footer from "../../components/footer/FooterAdmin.js";
// Layout components
import Navbar from "../../components/navbar/NavbarAdmin.js";
import Sidebar from "../../components/sidebar/Sidebar.js";

// Context / Provider (note singular "context" folder)
import { SidebarProvider } from "../../context/SidebarContext";

// React Router v5
import { Route, Switch, Redirect } from "react-router-dom";

// local routes file
import routes from "../../routes.js";

// local components and hooks used by admin layout
import GuestList from "../../components/GuestList";
import { useCollection } from "../../hooks/useCollection";
import EventsList from "../../components/EventsList";
import GetPackageInfo from "../../components/GetPackageInfo";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useDocument } from "../../hooks/useDocument";
import { useHistory } from "react-router-dom";
import TempTest from "../../pages/_TempTest";
import Dashboard from "../../pages/Dashboard.js";

import horizonTheme from "../../theme/horizonTheme";

export default function AdminLayout(props) {
  const { ...rest } = props;
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);

  // Chakra disclosure for responsive controls
  const { onOpen } = useDisclosure();

  // local disclosure (if you need it)
  const { isOpen, onToggle } = useDisclosure();

  // auth + user doc (guard user with optional chaining)
  const { user } = useAuthContext();
  const { document, error: userDocError } = useDocument("users", user?.uid);

  // show loading while user doc or user isn't ready
  // if (!user || !document) {
  //   return (
  //     <Flex minH="80vh" align="center" justify="center">
  //       <Spinner size="xl" color="blue.500" />
  //       <Text ml={3} fontSize="lg" fontWeight="bold" color="gray.600">
  //         Loading your dashboard...
  //       </Text>
  //     </Flex>
  //   );
  // }

  // helper that returns the active route name (unchanged)
  const getActiveRoute = (routesArray) => {
    let activeRoute = "Default Brand Text";
    for (let i = 0; i < routesArray.length; i++) {
      const r = routesArray[i];
      if (r.collapse) {
        const collapseActiveRoute = getActiveRoute(r.items);
        if (collapseActiveRoute !== activeRoute) return collapseActiveRoute;
      } else if (r.category) {
        const categoryActiveRoute = getActiveRoute(r.items);
        if (categoryActiveRoute !== activeRoute) return categoryActiveRoute;
      } else {
        if (window.location.href.indexOf(r.layout + r.path) !== -1) {
          return r.name;
        }
      }
    }
    return activeRoute;
  };

  const getActiveNavbar = (routesArray) => {
    let activeNavbar = false;
    for (let i = 0; i < routesArray.length; i++) {
      const r = routesArray[i];
      if (r.collapse) {
        const collapseActiveNavbar = getActiveNavbar(r.items);
        if (collapseActiveNavbar !== activeNavbar) return collapseActiveNavbar;
      } else if (r.category) {
        const categoryActiveNavbar = getActiveNavbar(r.items);
        if (categoryActiveNavbar !== activeNavbar) return categoryActiveNavbar;
      } else {
        if (window.location.href.indexOf(r.layout + r.path) !== -1) {
          return r.secondary;
        }
      }
    }
    return activeNavbar;
  };

  const getActiveNavbarText = (routesArray) => {
    let activeNavbar = false;
    for (let i = 0; i < routesArray.length; i++) {
      const r = routesArray[i];
      if (r.collapse) {
        const collapseActiveNavbar = getActiveNavbarText(r.items);
        if (collapseActiveNavbar !== activeNavbar) return collapseActiveNavbar;
      } else if (r.category) {
        const categoryActiveNavbar = getActiveNavbarText(r.items);
        if (categoryActiveNavbar !== activeNavbar) return categoryActiveNavbar;
      } else {
        if (window.location.href.indexOf(r.layout + r.path) !== -1) {
          return r.messageNavbar;
        }
      }
    }
    return activeNavbar;
  };

  // create Route components for React Router v5 (use full path: layout + path)
  const getRoutes = (routesArray) =>
    routesArray.map((route, key) => {
      if (route.layout === "/admin") {
        return (
          <Route
            exact
            path={route.layout + route.path}
            key={key}
            // render the component node so route.component (JSX) is shown
            render={() => route.component}
          />
        );
      }
      if (route.collapse) return getRoutes(route.items);
      return null;
    });

  // whether to show route contents (unchanged)
  const getRoute = () => window.location.pathname !== "/admin/full-screen-maps";

  return (
    <ChakraProvider theme={horizonTheme}>
      <Box>
        {/* <SidebarProvider> */}
          {/* <Sidebar routes={routes} display="none" {...rest} /> */}
          <Box
            float="right"
            minHeight="100vh"
            height="100%"
            overflow="auto"
            position="relative"
            maxHeight="100%"
            w={{ base: "100%", xl: "calc( 100% - 290px )" }}
          >
            <Portal>
              <Box>
                <Navbar
                  onOpen={onOpen}
                  logoText={"GuestPov Dashboard"}
                  brandText={getActiveRoute(routes)}
                  secondary={getActiveNavbar(routes)}
                  message={getActiveNavbarText(routes)}
                  fixed={fixed}
                  {...rest}
                />
              </Box>
            </Portal>

            {getRoute() ? (
              <Box
                mx="auto"
                p={{ base: "20px", md: "30px" }}
                pe="20px"
                minH="100vh"
                pt="50px"
              >
                <Dashboard />
              </Box>
            ) : null}

            <Box>
              <Footer />
            </Box>
          </Box>
        {/* </SidebarProvider> */}
      </Box>
    </ChakraProvider>
  );
}
