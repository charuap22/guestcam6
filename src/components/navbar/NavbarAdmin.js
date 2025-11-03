// src/components/navbar/AdminNavbar.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Link,
  Text,
  useColorModeValue,
  HStack,
  Button,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import AdminNavbarLinks from "./NavbarLinksAdmin";

import { FiMenu } from "react-icons/fi";
import { useHistory, useLocation } from "react-router-dom";

export default function AdminNavbar(props) {
  const [scrolled, setScrolled] = useState(false);
  const {
    secondary,
    message,
    brandText,
    onOpen,
    logoText,
    fixed,
    sidebarVisible = true, // NEW prop: controls whether sidebar is visible (admins)
  } = props;

  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    window.addEventListener("scroll", changeNavbar);
    return () => {
      window.removeEventListener("scroll", changeNavbar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeNavbar = () => {
    if (window.scrollY > 1) setScrolled(true);
    else setScrolled(false);
  };

  // color tokens
  const mainText = useColorModeValue("navy.700", "white");
  const secondaryText = useColorModeValue("gray.700", "white");
  const navbarBg = useColorModeValue(
    "rgba(244, 247, 254, 0.2)",
    "rgba(11,20,55,0.5)"
  );

  // helper to navigate links. If your event routes require an id, we can inject it here.
  const goTo = (path) => history.push(path);
  const isActive = (path) => location.pathname.includes(path);

  return (
    <Box
      position="fixed"
      boxShadow="none"
      bg={navbarBg}
      borderRadius="16px"
      borderWidth="1.5px"
      borderStyle="solid"
      filter="none"
      backdropFilter="blur(20px)"
      transition="box-shadow .25s linear, background-color .25s linear"
      alignItems={{ xl: "center" }}
      display={secondary ? "block" : "flex"}
      minH="75px"
      justifyContent={{ xl: "center" }}
      lineHeight="25.6px"
      mx="auto"
      pb="8px"
      right={{ base: "12px", md: "30px", lg: "30px", xl: "30px" }}
      px={{ sm: "15px", md: "10px" }}
      ps={{ xl: "12px" }}
      pt="8px"
      top={{ base: "12px", md: "16px", lg: "20px", xl: "20px" }}
      w={{
        base: "calc(100vw - 6%)",
        md: "calc(100vw - 8%)",
        lg: "calc(100vw - 6%)",
        xl: sidebarVisible ? "calc(100vw - 350px)" : "calc(100vw - 40px)",
        "2xl": sidebarVisible ? "calc(100vw - 365px)" : "calc(100vw - 40px)",
      }}
    >
      <Flex
        w="100%"
        flexDirection={{ base: "column", md: "row" }}
        alignItems={{ base: "flex-start", md: "center" }}
        justify={{ base: "center", md: "space-between" }}
        gap={{ base: 4, md: 0 }}
      >
        {/* LEFT: breadcrumb + brand + optional hamburger */}
        <Box
          w={{ base: "100%", md: "auto" }}
          display="flex"
          alignItems="center"
          gap={3}
        >
          {/* show hamburger only when sidebarVisible === true */}
          {sidebarVisible && (
            <Tooltip label="Open Sidebar">
              <IconButton
                aria-label="Open Sidebar"
                icon={<FiMenu />}
                onClick={onOpen}
                variant="ghost"
                display={{ base: "inline-flex", xl: "none" }}
                fontSize="20px"
              />
            </Tooltip>
          )}

          <Box>
            <Breadcrumb>
              <BreadcrumbItem color={secondaryText} fontSize="sm" mb="5px">
                <BreadcrumbLink href="#" color={secondaryText}>
                  Pages
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem color={secondaryText} fontSize="sm" mb="5px">
                <BreadcrumbLink href="#" color={secondaryText}>
                  {brandText}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Link
              color={mainText}
              href="#"
              bg="inherit"
              borderRadius="inherit"
              fontWeight="bold"
              fontSize="34px"
              _hover={{ color: mainText }}
              _active={{
                bg: "inherit",
                transform: "none",
                borderColor: "transparent",
              }}
              _focus={{
                boxShadow: "none",
              }}
            >
              {brandText}
            </Link>
          </Box>
        </Box>

        {/* CENTER: photos / videos / guestbook links (always visible) */}
        <HStack spacing={{ base: 2, md: 4 }} justify="center" flex="1" w="full">
          <Button
            variant={isActive("/gallery") ? "solid" : "ghost"}
            colorScheme={isActive("/gallery") ? "yellow" : "gray"}
            size="sm"
            onClick={() => goTo("/gallery")}
            fontWeight={isActive("/gallery") ? "600" : "500"}
          >
            Photos
          </Button>

          <Button
            variant={isActive("/videos") ? "solid" : "ghost"}
            colorScheme={isActive("/videos") ? "yellow" : "gray"}
            size="sm"
            onClick={() => goTo("/videos")}
            fontWeight={isActive("/videos") ? "600" : "500"}
          >
            Videos
          </Button>

          <Button
            variant={isActive("/guestbook") ? "solid" : "ghost"}
            colorScheme={isActive("/guestbook") ? "yellow" : "gray"}
            size="sm"
            onClick={() => goTo("/guestbook")}
            fontWeight={isActive("/guestbook") ? "600" : "500"}
          >
            Guestbook
          </Button>
        </HStack>

        {/* RIGHT: admin links only when sidebarVisible */}
        <Box
          w={{ base: "100%", md: "auto" }}
          ms={{ base: 0, md: "auto" }}
          display="flex"
          justifyContent={{ base: "center", md: "flex-end" }}
        >
          {sidebarVisible ? (
            <AdminNavbarLinks
              onOpen={props.onOpen}
              logoText={props.logoText}
              secondary={props.secondary}
              fixed={props.fixed}
              scrolled={scrolled}
            />
          ) : null}
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
  sidebarVisible: PropTypes.bool, // allow prop to hide sidebar controls
};
