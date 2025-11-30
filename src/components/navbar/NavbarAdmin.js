// src/components/navbar/AdminNavbar.jsx
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import AdminNavbarLinks from "../navbar/NavbarLinksAdmin";

export default function AdminNavbar(props) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.addEventListener("scroll", changeNavbar);
    return () => window.removeEventListener("scroll", changeNavbar);
  }, []);

  const { secondary, message, brandText: propBrandText } = props;

  const mainText = useColorModeValue("navy.700", "white");
  const secondaryText = useColorModeValue("gray.700", "white");

  const changeNavbar = () => setScrolled(window.scrollY > 1);

  // Derive brand text from the URL path (case-insensitive)
  const brandText = useMemo(() => {
    if (!location || !location.pathname) return propBrandText || "Pages";
    const path = location.pathname.toLowerCase();

    if (
      path.includes("/dashboard") ||
      path === "/admin" ||
      path === "/admin/"
    ) {
      return "Dashboard";
    }
    if (path.includes("/gallery")) return "Gallery";
    if (path.includes("/videos")) return "Videos";
    if (path.includes("/guestbook")) return "Guestbook";

    if (
      path.includes("/edit-event") ||
      path.includes("/create-event") ||
      path.includes("/event")
    ) {
      return "Event";
    }

    return propBrandText || "Pages";
  }, [location, propBrandText]);

  return (
    <Box
      position="fixed"
      top={{ base: "12px", md: "16px", lg: "20px", xl: "20px" }}
      /* CENTER NAVBAR PILL ON MOBILE */
      left={{ base: "50%", md: "30px" }}
      right={{ base: "auto", md: "30px" }}
      transform={{ base: "translateX(-50%)", md: "none" }}
      /* WIDTH BEHAVIOR */
      w={{ base: "auto", md: "calc(100% - 60px)" }}
      maxW={{ base: "560px", md: "none" }}
      mx="0"
      minH="75px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      /* Transparent bg */
      bg={useColorModeValue("rgba(244,247,254,0.2)", "rgba(11,20,55,0.5)")}
      borderRadius="16px"
      borderWidth="1.5px"
      borderStyle="solid"
      borderColor="transparent"
      boxShadow="none"
      p={{ base: "10px 14px", md: "8px" }}
      zIndex="overlay"
    >
      <Flex
        w="100%"
        flexDirection={{ base: "column", md: "row" }}
        alignItems={{ base: "center", md: "center" }}
        justify={{ base: "center", md: "space-between" }}
        gap={{ base: 4, md: 0 }}
      >
        {/* LEFT SIDE (Brand Title) */}
        <Box
          w={{ base: "100%", md: "auto" }}
          textAlign={{ base: "center", md: "left" }}
          flex="0 0 auto"
        >
          <Link
            color={mainText}
            fontWeight="bold"
            fontSize="34px"
            display="inline-block"
            _hover={{ color: mainText }}
          >
            {brandText}
          </Link>
        </Box>

        {/* RIGHT SIDE (Icons + Avatar) */}
        <Box
          w={{ base: "auto", md: "auto" }}
          ml={{ base: 0, md: "auto" }}
          display="flex"
          justifyContent={{ base: "center", md: "flex-end" }}
          alignItems="center"
          flex="0 0 auto"
        >
          <AdminNavbarLinks
            onOpen={props.onOpen}
            logoText={props.logoText}
            secondary={props.secondary}
            fixed={props.fixed}
            scrolled={scrolled}
          />
        </Box>
      </Flex>

      {secondary ? <Text color="white">{message}</Text> : null}
    </Box>
  );
}

AdminNavbar.propTypes = {
  brandText: PropTypes.string,
  variant: PropTypes.string,
  secondary: PropTypes.bool,
  fixed: PropTypes.bool,
  onOpen: PropTypes.func,
};
