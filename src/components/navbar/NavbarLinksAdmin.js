// src/components/navbar/NavbarLinksAdmin.js
import React, { useEffect } from "react";
import PropTypes from "prop-types";

import {
  Avatar,
  Flex,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  HStack,
  Tooltip,
  Button,
  Icon,
  IconButton,
  Box,
  useBreakpointValue,
  useToast,
  VStack,
  Spacer,
} from "@chakra-ui/react";
import { useHistory, useParams } from "react-router-dom";
import {
  FiCalendar,
  FiSettings,
  FiImage,
  FiVideo,
  FiBook,
  FiLogOut,
  FiGrid,
} from "react-icons/fi";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useLogout } from "../../hooks/useLogout";
import { useEvent } from "../../hooks/useEvent";
import { useDocument } from "../../hooks/useDocument";
import { useCollection } from "../../hooks/useCollection";
import { useUserInfo } from "../../hooks/useUserInfo";

export default function HeaderLinks(props) {
  const { secondary } = props;
  const history = useHistory();
  const params = useParams();
  const toast = useToast();
const [loggingOut, setLoggingOut] = React.useState(false);

  // Theme colors
  const deepPurple = "#2C1633";
  const gold = "#D9A800";
  const teal = "#2CAAA2";
  const orange = "#FF7A3D";
  const blue = "#4C8CF5";

  const menuBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("gray.800", "white");
  const shadowLight = "8px 14px 30px rgba(30,40,80,0.06)";
  const shadowDark = "8px 14px 30px rgba(0,0,0,0.25)";
  const borderColor = useColorModeValue("#E6ECFA", "rgba(135, 140, 189, 0.3)");

  // Hooks
  const { user } = useAuthContext();
  const { UserInfo } = useUserInfo();
  const { logout, isPending } = useLogout();
  const { eventId: ctxEventId } = useEvent();

  // Try to detect an eventId from a guest-dashboard URL:
  // matches: /admin/guest-dashboard/:eventId
  const guestEventIdFromUrl = React.useMemo(() => {
    if (typeof window === "undefined") return null;

    const path = window.location.pathname;

    // supports:
    // /admin/guest-dashboard/:id
    // /admin/gallery/guest/:id
    // /admin/videos/guest/:id
    // /admin/guestbook/guest/:id
    const match = path.match(
      /\/admin\/(guest-dashboard|gallery\/guest|videos\/guest|guestbook\/guest)\/([^/]+)/
    );

    return match ? match[2] : null;
  }, []);

  // Resolve currentEventId using many fallbacks:
  // 1) event context (ctxEventId)
  // 2) route params (params.eventId or params.id)
  // 3) guest URL extractor (guestEventIdFromUrl) — used especially when a guest is logged in
  // 4) null if none found
  const isGuest = user?.isAnonymous || UserInfo?.role === "guest";
  const normalizeId = (id) =>
    typeof id === "string" && id.trim() === "" ? null : id;

  const eventIdFromUrl = React.useMemo(() => {
    if (typeof window === "undefined") return null;

    const path = window.location.pathname;

    // Supports BOTH owner + guest routes
    const match = path.match(
      /\/admin\/(guestbook|gallery|videos)\/(owner|guest)\/([^/]+)/
    );

    return match ? match[3] : null;
  }, []);

  const currentEventId = normalizeId(
    ctxEventId ||
      eventIdFromUrl || // 🔥 THIS FIXES OWNER ROUTES
      params.eventId ||
      params.id
  );

  const { document: userDoc } = useDocument("users", user?.uid);
  const { document: eventDoc } = useDocument("events", currentEventId);

  const { documents: userEvents = [] } = useCollection("events", [
    "adminId",
    "==",
    user?.uid,
  ]);

  // owner check
  const normalize = (id) =>
    typeof id === "string" ? id.trim().toLowerCase() : id;
  const eventOwnerId =
    normalize(eventDoc?.adminId) ||
    normalize(eventDoc?.createdBy?.id) ||
    normalize(eventDoc?.createdBy?.uid);
  const isOwner = !!(
    eventOwnerId &&
    user?.uid &&
    eventOwnerId === normalize(user.uid)
  );

  const isMobile = useBreakpointValue({ base: true, md: false });

  // constants
  const HOME_ROUTE = "/admin/dashboard";
  const MANAGE_EVENT_ROUTE = (id) => `/admin/events/${id}`;
  const getGuestEventId = () => {
    if (!isGuest) return null;

    // Prefer URL-based event id for guests
    return guestEventIdFromUrl || params.id || params.eventId || null;
  };

  const pickTargetId = () => {
    // ✅ 1. ALWAYS trust route param first
    if (params?.id) return params.id;

    // ✅ 2. Guests: fallback to URL parsing
    const guestId = getGuestEventId();
    if (guestId) return guestId;

    // ✅ 3. Owners: context fallback
    if (currentEventId) return currentEventId;

    // ✅ 4. Owners: first owned event
    if (isOwner && Array.isArray(userEvents) && userEvents.length > 0) {
      return userEvents[0].id;
    }

    return null;
  };
  console.log("Navbar event resolution", {
    isGuest,
    guestEventIdFromUrl,
    ctxEventId,
    params,
    picked: pickTargetId(),
  });
  useEffect(() => {
    console.debug("Navbar event resolution", {
      isGuest,
      guestEventIdFromUrl,
      ctxEventId,
      params,
      picked: pickTargetId(),
    });
  }, []);

  // gallery handler
  const handleOpenGallery = (roleBase) => {
    const targetId = pickTargetId();
    if (!targetId) {
      toast({
        title: "No event found",
        description: isOwner
          ? "Create your first event to continue."
          : "Open an event first.",
        status: "info",
      });
      if (isOwner) history.push("/admin/create-event");
      return;
    }
    history.push(`/admin/gallery/${roleBase}/${targetId}`);
  };

  // ---------- NEW: open guest dashboard ----------
  const openGuestDashboard = () => {
    const targetId = pickTargetId();
    if (!targetId) {
      toast({
        title: "No event found",
        description: "No event id found in the URL or your account.",
        status: "warning",
      });
      return;
    }
    history.push(`/admin/guest-dashboard/${targetId}`);
  };

  // **Mobile icon**
  const mobileIconProps = {
    isRound: true,
    size: "sm",
    boxShadow: useColorModeValue(shadowLight, shadowDark),
    _active: { transform: "translateY(1px)" },
    _hover: {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    },
  };

  const MobileIcon = ({ label, icon, bg, onClick, disabled }) => (
    <Tooltip label={label} placement="bottom">
      <IconButton
        aria-label={label}
        icon={<Icon as={icon} w={5} h={5} />}
        onClick={onClick}
        {...mobileIconProps}
        bg={bg}
        color="white"
        isDisabled={disabled}
        style={{ width: 44, height: 44 }}
      />
    </Tooltip>
  );

  // desktop text link pattern
  const desktopLinkBase = {
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    fontWeight: 800,
    fontSize: "sm",
    color: textColor,
    _hover: { color: gold, textDecoration: "none" },
  };

  // If user is a guest (anonymous or role === 'guest') and we found an ID in URL,
  // prefer that ID for navigation. Explanation shown as console.debug to help local dev.
  React.useEffect(() => {
    const isGuest = user?.isAnonymous || UserInfo?.role === "guest";
    if (isGuest && guestEventIdFromUrl) {
      // optional debug for devs — remove in production if noisy
      // eslint-disable-next-line no-console
      console.debug(
        "Guest detected — using eventId from URL:",
        guestEventIdFromUrl
      );
    }
  }, [user, UserInfo, guestEventIdFromUrl]);

  return (
    <Flex
      w="auto"
      mx={{ base: "auto", md: "0" }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap="nowrap"
      p={{ base: "8px 10px", md: "10px" }}
      borderRadius="30px"
      boxShadow={useColorModeValue(shadowLight, shadowDark)}
      justifyContent={{ base: "center", md: "flex-end" }}
      gap={{ base: 2, md: 4 }}
      overflow="hidden"
      whiteSpace="nowrap"
      zIndex="overlay"
    >
      {/* -----------------------------
          OWNER SECTION (LEFT BUTTON)
         ----------------------------- */}
      {isOwner && (
        <>
          {isMobile ? (
            <MobileIcon
              label="Dashboard"
              icon={FiCalendar}
              bg={gold}
              onClick={() => history.push(HOME_ROUTE)}
            />
          ) : (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Icon as={FiCalendar} color={deepPurple} w={5} h={5} />}
              onClick={() => history.push(HOME_ROUTE)}
              fontWeight={800}
              color={textColor}
              _hover={{ color: deepPurple }}
            >
              Dashboard
            </Button>
          )}
        </>
      )}

      {/* -----------------------------
          MAIN NAV (PHOTOS / VIDEOS / GUESTBOOK)
         ----------------------------- */}
      {isMobile ? (
        <>
          {/* NEW: Guest Dashboard mobile icon (visible for guests) */}
          {isGuest && (
            <MobileIcon
              label="Dashboard"
              icon={FiGrid}
              bg="#6C5CE7"
              onClick={() => {
                const id = pickTargetId();
                if (id) history.push(`/admin/guest-dashboard/${id}`);
                else
                  toast({
                    title: "No event found",
                    status: "warning",
                    description: "No event id found for the guest dashboard.",
                  });
              }}
            />
          )}
          <MobileIcon
            label="Photos"
            icon={FiImage}
            bg={teal}
            onClick={() => handleOpenGallery(isOwner ? "owner" : "guest")}
          />

          <MobileIcon
            label="Videos"
            icon={FiVideo}
            bg={orange}
            onClick={() => {
              const id = pickTargetId();
              if (id)
                history.push(
                  `/admin/videos/${isOwner ? "owner" : "guest"}/${id}`
                );
              else
                toast({
                  title: "No event found",
                  status: "warning",
                });
            }}
          />

          <MobileIcon
            label="Guestbook"
            icon={FiBook}
            bg={blue}
            onClick={() => {
              const id = pickTargetId();
              if (id)
                history.push(
                  `/admin/guestbook/${isOwner ? "owner" : "guest"}/${id}`
                );
              else toast({ title: "No event found", status: "warning" });
            }}
          />
        </>
      ) : (
        <Flex align="center" gap={6} flexWrap="nowrap">
          {/* NEW: Guest Dashboard button (desktop) visible for guests */}
          {isGuest && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Icon as={FiGrid} color="#6C5CE7" w={5} h={5} />}
              onClick={openGuestDashboard}
              fontWeight={800}
              color={textColor}
              _hover={{ color: "#6C5CE7" }}
            >
              Dashboard
            </Button>
          )}
          {/* Photos */}
          <Link
            as="button"
            onClick={() => {
              const id = pickTargetId();
              if (id)
                history.push(
                  `/admin/gallery/${isOwner ? "owner" : "guest"}/${id}`
                );
              else toast({ title: "No event found", status: "warning" });
            }}
            {...desktopLinkBase}
          >
            <Icon as={FiImage} color={teal} w={5} h={5} />
            <Box as="span">Photos</Box>
          </Link>

          {/* Videos */}
          <Link
            as="button"
            onClick={() => {
              const id = pickTargetId();
              if (id)
                history.push(
                  `/admin/videos/${isOwner ? "owner" : "guest"}/${id}`
                );
              else toast({ title: "No event found", status: "warning" });
            }}
            {...desktopLinkBase}
          >
            <Icon as={FiVideo} color={orange} w={5} h={5} />
            <Box as="span">Videos</Box>
          </Link>

          {/* Guestbook */}
          <Link
            as="button"
            onClick={() => {
              const id = pickTargetId();
              if (id)
                history.push(
                  `/admin/guestbook/${isOwner ? "owner" : "guest"}/${id}`
                );
              else toast({ title: "No event found", status: "warning" });
            }}
            {...desktopLinkBase}
          >
            <Icon as={FiBook} color={blue} w={5} h={5} />
            <Box as="span">Guestbook</Box>
          </Link>
        </Flex>
      )}

      {/* -----------------------------
          AVATAR MENU
         ----------------------------- */}
      <Box ml={{ base: 0, md: "auto" }}>
        <Menu>
          <MenuButton p="0px">
            <HStack spacing={2}>
              <Avatar
                _hover={{ cursor: "pointer", transform: "translateY(-2px)" }}
                transition="all 0.18s"
                color="white"
                name={user?.displayName || "Guest"}
                bg={deepPurple}
                size="sm"
                w="42px"
                h="42px"
                src={user?.photoURL}
              />
            </HStack>
          </MenuButton>

          <MenuList
            boxShadow={useColorModeValue("lg", "dark-lg")}
            p="0px"
            mt="10px"
            borderRadius="20px"
            bg={menuBg}
            border="none"
          >
            <Flex w="100%">
              <Text
                ps="20px"
                pt="16px"
                pb="10px"
                w="100%"
                borderBottom="1px solid"
                borderColor={borderColor}
                fontSize="sm"
                fontWeight="700"
                color={textColor}
              >
                👋 Hey, {user?.displayName || "Guest"}
              </Text>
            </Flex>

            <Flex flexDirection="column" p="10px">
              <MenuItem
                _hover={{ bg: "none", color: "red.500" }}
                isDisabled={isPending || loggingOut}
                onClick={async () => {
                  try {
                    setLoggingOut(true);

                    await logout();

                    toast({
                      title: "Signed out",
                      description: "You have been logged out safely.",
                      status: "success",
                      duration: 2000,
                    });

                    history.replace("/login");
                  } catch (err) {
                    setLoggingOut(false);
                    toast({
                      title: "Logout failed",
                      description: err?.message || "Something went wrong.",
                      status: "error",
                    });
                  }
                }}
              >
                <Icon as={FiLogOut} mr={2} />
                <Text fontSize="sm">
                  {loggingOut ? "Signing out…" : "Log out"}
                </Text>
              </MenuItem>
            </Flex>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};
