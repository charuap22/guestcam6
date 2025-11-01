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
import Sidebar from "../components/sidebar/Sidebar";
import { SidebarProvider, SidebarContext } from "../context/SidebarContext";
import { Switch, Route, Redirect } from "react-router-dom";
import routes from "../routes";

export default function HorizonDashboard(props) {
  const { ...rest } = props;
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const { onOpen } = useDisclosure();

  // ✅ Hide sidebar completely on mobile (do not render)
  const showSidebar = useBreakpointValue({ base: false, xl: true });

  const getRoutes = (routesArray) =>
    routesArray.map((route, key) => {
      if (route.layout === "/admin") {
        return (
          <Route
            exact
            path={route.layout + route.path}
            key={key}
            render={() => route.component}
          />
        );
      }
      return null;
    });

  const Provider = SidebarContext ? SidebarContext.Provider : SidebarProvider;

  return (
    <Provider value={{ toggleSidebar, setToggleSidebar }}>
      <Box>
        {/* ✅ Sidebar only renders on desktop */}
        {showSidebar && <Sidebar routes={routes} display="block" {...rest} />}

        <Box
          float="right"
          minHeight="100vh"
          height="100%"
          overflow="auto"
          position="relative"
          w={{ base: "100%", xl: "calc(100% - 290px)" }}
          transition="all 0.3s ease"
        >
          <Portal>
            <Navbar
              onOpen={() => setToggleSidebar(true)} // 🔹 link to sidebar toggle
              logoText="GUESTPOV"
              brandText="Dashboard"
              fixed={fixed}
              {...rest}
            />
          </Portal>

          <Box mx="auto" p={{ base: "20px", md: "30px" }} pt="50px">
            <Switch>
              {getRoutes(routes)}
              <Redirect exact from="/admin" to="/admin/default" />
            </Switch>
          </Box>

          
          
        </Box>
      </Box>
    </Provider>
  );
}
