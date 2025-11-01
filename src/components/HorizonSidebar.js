import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Avatar,
  Divider,
  Link as ChakraLink,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  SettingsIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import { FiUsers, FiGrid, FiBookOpen } from "react-icons/fi";
import { NavLink } from "react-router-dom";

export default function HorizonSidebar({
  compact = false,
  role = "user",
  onCollapseToggle,
}) {
  const sidebarBg = useColorModeValue("brand.600", "brand.700");
  const linkColor = useColorModeValue("whiteAlpha.900", "whiteAlpha.900");
  const muted = useColorModeValue("whiteAlpha.800", "whiteAlpha.700");

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: FiGrid },
    { label: "Events", to: "/events", icon: CalendarIcon },
    { label: "Gallery", to: "/gallery", icon: ViewIcon },
    { label: "Guests", to: "/guests", icon: FiUsers },
    { label: "Templates", to: "/canvaTemplates", icon: FiBookOpen },
    { label: "Settings", to: "/settings", icon: SettingsIcon },
  ];

  return (
    <Box
      as="aside"
      minH="100vh"
      w={{ base: compact ? "16" : "60", md: "64" }}
      bgGradient="linear(to-b, brand.600, brand.700)"
      color="white"
      px={4}
      py={6}
    >
      <VStack align="start" spacing={6}>
        <HStack justify="space-between" w="full">
          <HStack>
            <Box
              boxSize="10"
              bg="whiteAlpha.200"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontWeight="bold" fontSize="lg">
                H
              </Text>
            </Box>
            <Text
              fontWeight="700"
              fontSize="md"
              display={{ base: "none", md: "block" }}
            >
              Horizon
            </Text>
          </HStack>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="collapse"
            icon={compact ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            color={muted}
            onClick={onCollapseToggle}
          />
        </HStack>

        <VStack align="start" spacing={1} w="full">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <ChakraLink
                as={NavLink}
                to={item.to}
                key={item.to}
                style={{ width: "100%" }}
                _activeLink={{ bg: "whiteAlpha.200" }}
                px={3}
                py={2}
                borderRadius="md"
                color={linkColor}
                _hover={{ textDecor: "none", bg: "whiteAlpha.100" }}
              >
                <HStack spacing={3}>
                  <Box>
                    <Icon />
                  </Box>
                  <Text display={{ base: "none", md: "block" }}>
                    {item.label}
                  </Text>
                </HStack>
              </ChakraLink>
            );
          })}
        </VStack>

        <Box pt={6} w="full">
          <Divider borderColor="whiteAlpha.200" />
          <HStack spacing={3} mt={4}>
            <Avatar name="Admin" size="sm" />
            <VStack
              spacing={0}
              align="start"
              display={{ base: "none", md: "flex" }}
            >
              <Text fontSize="sm" fontWeight="600">
                Admin
              </Text>
              <Text fontSize="xs" color="whiteAlpha.800">
                {role}
              </Text>
            </VStack>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
}
