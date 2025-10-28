import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";

import {
  
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Center,
  Fade,
  ScaleFade,
  Slide,
  SlideFade,
  Collapse,
  Button,
} from "@chakra-ui/react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
  FiBell,
  FiChevronDown,
} from "react-icons/fi";
import { CalendarIcon } from "@chakra-ui/icons";
import { IconType } from "react-icons";
import { ReactText } from "react";
import { AvatarInfo } from "./AvatarInfo";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useHistory } from "react-router-dom";

// interface LinkItemProps {
//   name: string;
//   icon: IconType;
// }
const LinkItems = [
  { name: "Home", icon: FiHome, url: "/" },
  { name: "Photos", icon: FiTrendingUp, url: "/create-event" },
  { name: "Videos", icon: FiSettings, url: "/" },
  { name: "GuestBook", icon: FiSettings, url: "/" },
];

export default function Sidebar_Guest({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav display={{ base: "flex", md: "none" }} onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
}

// interface SidebarProps extends BoxProps {
//   onClose: () => void;
// }

const SidebarContent = ({ onClose, ...rest }) => {
  const { id } = useParams();
  console.log("Sidebar_Guest -> useParams id:", id);

  const GuestLinkItems = [
    {
      name: "Dashboard",
      icon: FiHome,
      url: `/Guest/Dashboard/${id || "missing"}`,
    },
    {
      name: "Gallery",
      icon: FiTrendingUp,
      url: `/Guest/Gallery/${id || "missing"}`,
    },
    {
      name: "Videos",
      icon: FiSettings,
      url: `/Guest/Videos/${id || "missing"}`,
    },
    {
      name: "GuestBook",
      icon: FiCompass,
      url: `/Guest/Guestbook/${id || "missing"}`,
    },
  ];

  return (
    <Box
      bgGradient="linear(to-b, #111827,#111827, #745710)"
      color="white"
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          GUESTPOV
        </Text>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>

      <br />
      <AvatarInfo />
      <br />

      {/* Debug info */}
      {/* <Text fontSize="sm" color="yellow.300" px="4">
        Event ID: {id || "undefined"}
      </Text> */}

      {GuestLinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} to={link.url}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};


// interface NavItemProps extends FlexProps {
//   icon: IconType;
//   children: ReactText;
// }
const NavItem = ({ icon, children, ...rest }) => {
  return (
    <Box
      as="a"
      href="#"
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: "cyan.400",
          color: "white",
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: "white",
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Box>
  );
};

// interface MobileProps extends FlexProps {
//   onOpen: () => void;
// }
const MobileNav = ({ onOpen, ...rest }) => {
  const { logout, isPending } = useLogout();
  const { user } = useAuthContext();

  return (
    <Flex
      display={{ base: "flex", md: "none" }}
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent="flex-start"
    >
      <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
        GUESTPOV
      </Text>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Flex>
  );
};
