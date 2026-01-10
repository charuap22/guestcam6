import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Box, Flex, Link, Text, useColorModeValue } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

import AdminNavbarLinks from "./NavbarLinksAdmin";

export default function AdminNavbar(props) {
  const { secondary, message, brandText: propBrandText } = props;

  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  /* ---------------- Scroll handling ---------------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 1);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------------- Theme ---------------- */
  const mainText = useColorModeValue("navy.700", "white");

  /* ---------------- Brand text (route-based only) ---------------- */
  const brandText = useMemo(() => {
    if (!location?.pathname) return propBrandText || "Pages";

    const path = location.pathname.toLowerCase();

    if (path === "/admin" || path === "/admin/") return "Dashboard";
    if (path.includes("/dashboard")) return "Dashboard";
    if (path.includes("/guest-dashboard")) return "Dashboard";
    if (path.includes("/gallery")) return "Photos";
    if (path.includes("/videos")) return "Videos";
    if (path.includes("/guestbook")) return "Guestbook";
    if (
      path.includes("/edit-event") ||
      path.includes("/create-event") ||
      path.includes("/events/")
    ) {
      return "Event";
    }

    return propBrandText || "Pages";
  }, [location.pathname, propBrandText]);

  /* ---------------- Render ---------------- */
  return (
    <Box
      position="fixed"
      top={{ base: "12px", md: "16px", lg: "20px" }}
      left={{ base: "50%", md: "30px" }}
      right={{ base: "auto", md: "30px" }}
      transform={{ base: "translateX(-50%)", md: "none" }}
      w={{ base: "auto", md: "calc(100% - 60px)" }}
      maxW={{ base: "560px", md: "none" }}
      minH="75px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue("rgba(244,247,254,0.2)", "rgba(11,20,55,0.5)")}
      borderRadius="16px"
      borderWidth="1.5px"
      borderColor="transparent"
      p={{ base: "10px 14px", md: "8px" }}
      zIndex="overlay"
    >
      <Flex
        w="100%"
        flexDirection={{ base: "column", md: "row" }}
        alignItems="center"
        justify={{ base: "center", md: "space-between" }}
        gap={{ base: 4, md: 0 }}
      >
        {/* ---------- Brand ---------- */}
        <Box
          w={{ base: "100%", md: "auto" }}
          textAlign={{ base: "center", md: "left" }}
        >
          <Link
            color={mainText}
            fontWeight="bold"
            fontSize="34px"
            _hover={{ color: mainText, textDecoration: "none" }}
          >
            {brandText}
          </Link>
        </Box>

        {/* ---------- Actions ---------- */}
        <Box
          ml={{ base: 0, md: "auto" }}
          display="flex"
          alignItems="center"
          justifyContent={{ base: "center", md: "flex-end" }}
        >
          <AdminNavbarLinks
            onOpen={props.onOpen}
            logoText={props.logoText}
            secondary={secondary}
            fixed={props.fixed}
            scrolled={scrolled}
          />
        </Box>
      </Flex>

      {secondary && message ? (
        <Text color="white" mt={2}>
          {message}
        </Text>
      ) : null}
    </Box>
  );
}

AdminNavbar.propTypes = {
  brandText: PropTypes.string,
  secondary: PropTypes.bool,
  fixed: PropTypes.bool,
  onOpen: PropTypes.func,
  logoText: PropTypes.string,
  message: PropTypes.string,
};
