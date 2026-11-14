// src/components/Sidebar/SidebarLinks.jsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  HStack,
  Text,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import {
  MdDashboard,
  MdEvent,
  MdPhotoLibrary,
  MdVideoLibrary,
  MdBook,
  MdPerson,
  MdWork,
  MdLogout,
  MdSlideshow,
} from "react-icons/md";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useDocument } from "../../../hooks/useDocument";

export function SidebarLinks(props) {
  const location = useLocation();
  const activeColor = useColorModeValue("gray.700", "white");
  const inactiveColor = useColorModeValue(
    "secondaryGray.600",
    "secondaryGray.600"
  );
  const activeIcon = useColorModeValue("brand.500", "white");
  const textColor = useColorModeValue("secondaryGray.500", "white");
  const brandColor = useColorModeValue("brand.500", "brand.400");

  // get auth & user doc
  const { user } = useAuthContext();
  const { document: userDoc } = useDocument("users", user?.uid);

  // determine owner vs guest
  // matches your logic: show for logged-in non-guest OR if user has package
  const isOwner = (!!user && !userDoc?.isGuest) || !!userDoc?.package;

  // link definitions
  const ownerLinks = [
    { name: "Dashboard", to: "/admin/dashboard", icon: MdDashboard },
    { name: "Event", to: "/admin/events", icon: MdEvent }, // change to exact path you use
    { name: "Photos", to: "/admin/gallery/owner/:id", icon: MdPhotoLibrary },
    { name: "Videos", to: "/admin/videos/owner/:id", icon: MdVideoLibrary },
    { name: "Guestbook", to: "/admin/guestbook/owner/:id", icon: MdBook },
    { name: "Profile", to: "/admin/profile", icon: MdPerson },
    { name: "Package", to: "/admin/pricing", icon: MdWork },
    { name: "Slideshow", to: "/admin/slideshow/:id", icon: MdSlideshow },
    { name: "Logout", to: "/auth/logout", icon: MdLogout },
  ];

  const guestLinks = [
    { name: "Photos", to: "/admin/gallery/guest/:id", icon: MdPhotoLibrary },
    { name: "Videos", to: "/admin/videos/guest/:id", icon: MdVideoLibrary },
    { name: "Slideshow", to: "/admin/slideshow/:id", icon: MdSlideshow },
    { name: "Logout", to: "/auth/logout", icon: MdLogout },
  ];

  const linksToRender = isOwner ? ownerLinks : guestLinks;

  const activeRoute = (routePath) =>
    location.pathname.includes(routePath.replace(/:.*$/, ""));

  return (
    <>
      {linksToRender.map((route, idx) => (
        <NavLink key={idx} to={route.to}>
          <Box>
            <HStack
              spacing={activeRoute(route.to) ? "22px" : "26px"}
              py="10px"
              ps="10px"
            >
              <Flex w="100%" alignItems="center" justifyContent="center">
                <Box
                  color={activeRoute(route.to) ? activeIcon : textColor}
                  me="18px"
                >
                  <Icon as={route.icon} w="20px" h="20px" />
                </Box>

                <Text
                  me="auto"
                  color={activeRoute(route.to) ? activeColor : inactiveColor}
                  fontWeight={activeRoute(route.to) ? "bold" : "normal"}
                >
                  {route.name}
                </Text>
              </Flex>

              <Box
                h="36px"
                w="4px"
                bg={activeRoute(route.to) ? brandColor : "transparent"}
                borderRadius="5px"
              />
            </HStack>
          </Box>
        </NavLink>
      ))}
    </>
  );
}

export default SidebarLinks;
