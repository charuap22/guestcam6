// Chakra Imports
import {
  Avatar,
  Button,
  Flex,
  Icon,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react";

// Custom Components
import { ItemContent } from "../menu/ItemContent";
import { SearchBar } from "../navbar/searchBar/SearchBar";
import { SidebarResponsive } from "../sidebar/Sidebar";
import PropTypes from "prop-types";
import React from "react";
// Assets
import navImage from "../../assets/img/layout/Navbar.png";
import { MdNotificationsNone, MdInfoOutline } from "react-icons/md";
import { IoMdMoon, IoMdSunny } from "react-icons/io";
import { FaEthereum } from "react-icons/fa";
import routes from "../../routes";

import { useAuthContext } from "../../hooks/useAuthContext";
import { useLogout } from "../../hooks/useLogout";
import { useEvent } from "../../hooks/useEvent";
export default function HeaderLinks(props) {
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  // Chakra Color Mode
  const navbarIcon = useColorModeValue("gray.400", "white");
  let menuBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorBrand = useColorModeValue("brand.700", "brand.400");
  const ethColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("#E6ECFA", "rgba(135, 140, 189, 0.3)");
  const ethBg = useColorModeValue("secondaryGray.300", "navy.900");
  const ethBox = useColorModeValue("white", "navy.800");
  const shadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.18)",
    "14px 17px 40px 4px rgba(112, 144, 176, 0.06)"
  );
  const borderButton = useColorModeValue("secondaryGray.500", "whiteAlpha.200");
  
    const { user } = useAuthContext();
  const { logout, isPending } = useLogout();
  const { eventId } = useEvent();
   
  return (
    <Flex
      w={{ sm: "100%", md: "auto" }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap={secondary ? { base: "wrap", md: "nowrap" } : "unset"}
      p="10px"
      borderRadius="30px"
      boxShadow={shadow}
    >
      <SidebarResponsive routes={routes} />

      <Flex
        align="center"
        gap={{ base: 6, md: 6 }}
        me="10px"
        ml={2}
        flexWrap={{ base: "wrap", md: "nowrap" }}
      >
        <Link
          href="#photos"
          fontWeight="600"
          fontSize="sm"
          color={textColor}
          _hover={{ color: textColorBrand }}
        >
          Photos
        </Link>
        <Link
          href="#videos"
          fontWeight="600"
          fontSize="sm"
          color={textColor}
          _hover={{ color: textColorBrand }}
        >
          Videos
        </Link>
        <Link
          href="#guestbook"
          fontWeight="600"
          fontSize="sm"
          color={textColor}
          _hover={{ color: textColorBrand }}
          mr={2}
        >
          Guestbook
        </Link>
      </Flex>

      <Menu>
        <MenuButton p="0px">
          <Avatar
            _hover={{ cursor: "pointer" }}
            color="white"
            name={user.displayName}
            bg="#11047A"
            size="sm"
            w="40px"
            h="40px"
            src={user.photoURL}
          />
        </MenuButton>
        <MenuList
          boxShadow={shadow}
          p="0px"
          mt="10px"
          borderRadius="20px"
          bg={menuBg}
          border="none"
        >
          <Flex w="100%" mb="0px">
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
              👋&nbsp; Hey, {user.displayName}
            </Text>
          </Flex>
          <Flex flexDirection="column" p="10px">
            {/* <MenuItem
              _hover={{ bg: "none" }}
              _focus={{ bg: "none" }}
              borderRadius="8px"
              px="14px"
            >
              <Text fontSize="sm">Profile Settings</Text>
            </MenuItem>
            <MenuItem
              _hover={{ bg: "none" }}
              _focus={{ bg: "none" }}
              borderRadius="8px"
              px="14px"
            >
              <Text fontSize="sm">Newsletter Settings</Text>
            </MenuItem> */}
            <MenuItem
              _hover={{ bg: "none" }}
              _focus={{ bg: "none" }}
              color="red.400"
              borderRadius="8px"
              px="14px"
            >
             
              <Text fontSize="sm" onClick={logout}>
                Log out
              </Text>
              
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};
