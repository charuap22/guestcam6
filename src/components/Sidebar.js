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
  Divider,
  AbsoluteCenter,
} from "@chakra-ui/react";
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
import { useHistory, Link } from "react-router-dom";
import { useEvent } from "../hooks/useEvent";
import { useUserInfo } from "../hooks/useUserInfo";

// interface LinkItemProps {
//   name: string;
//   icon: IconType;
// }

const LinkItems = [
  { name: "Home", icon: FiHome, url: "/" },
  { name: "Create Event", icon: FiTrendingUp, url: "/newevent" },
  { name: "Settings", icon: FiSettings, url: "/" },
];

export default function Sidebar({ role, children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { eventId } = useEvent();

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
      <SidebarContent
        role={role}
        eventId={eventId}
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
          <SidebarContent
            role={role}
            eventId={eventId}
            onClose={() => onClose}
            display={{ base: "none", md: "block" }}
            
          />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
}

// interface SidebarProps extends BoxProps {
//   onClose: () => void;
// }

const SidebarContent = ({ eventId, role, onClose, ...rest }) => {
  // const { user } = useAuthContext();
  // console.log(user);
  // if (!user) {
  //   return <div className="loading">Loading...</div>;
  // }
  const LinkItems_Guest = [
    {
      name: "Home",
      icon: FiHome,
      url: `/Guest/Dashboard/${eventId}`,
    },
    { name: "Photos", icon: FiTrendingUp, url: `/gallery/${role}/${eventId}` },
    { name: "Videos", icon: FiSettings, url: `/videos/${role}/${eventId}` },
    {
      name: "GuestBook",
      icon: FiSettings,
      url: `/guestbook/${role}/${eventId}`,
    },
  ];
  const EventLinks = [
    {
      name: "Photos",
      icon: FiTrendingUp,
      url: `/gallery/${role}/${eventId}`,
    },
    {
      name: "Videos",
      icon: FiSettings,
      url: `/videos/${role}/${eventId}`,
    },
    {
      name: "GuestBook",
      icon: FiSettings,
      url: `/guestbook/${role}/${eventId}`,
    },
  ];
  const { logout, isPending } = useLogout();

  return (
    <Box
      transition="3s ease"
      // bgColor= "rgb(70, 66, 1)"
      bgGradient="linear(to-b, #111827,#111827, #745710)"
      color="rgb(255, 255, 255)"
      borderRight="1px"
      borderRightColor={"gray.200"}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          GUESTCAM
        </Text>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      <br></br>
      <AvatarInfo />
      <br></br>
      {role == "Admin" &&
        LinkItems.map((link) => (
          <NavItem key={link.name} icon={link.icon} url={link.url}>
            {link.name}
          </NavItem>
        ))}

      {role == "Admin" && eventId && (
        <>
          <Box position="relative" padding="5">
            <Divider />
            <AbsoluteCenter bg="#302e2a" px="4">
              Event
            </AbsoluteCenter>
          </Box>
          {EventLinks.map((link) => (
            <NavItem key={link.name} icon={link.icon} url={link.url}>
              {link.name}
            </NavItem>
          ))}
        </>
      )}
      {role == "Guest" &&
        eventId &&
        LinkItems_Guest.map((link) => (
          <NavItem key={link.name} icon={link.icon} url={link.url}>
            {link.name}
          </NavItem>
        ))}

      {!isPending && role == "Admin" && (
        <NavItem url={"#"} onClick={logout}>
          Logout
        </NavItem>
      )}
      {isPending && (
        <NavItem url={"#"} disabled>
          Logging out...
        </NavItem>
      )}
    </Box>
  );
};

// interface NavItemProps extends FlexProps {
//   icon: IconType;
//   children: ReactText;
// }
const NavItem = ({ icon, children, url, ...rest }) => {
  return (
    <Link
      to={url}
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
    >
      <Flex
        align="center"
        p="2"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: "rgba(250,233,133,0.17  )",
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
    </Link>
  );
};

// interface MobileProps extends FlexProps {
//   onOpen: () => void;
// }
const MobileNav = ({ onOpen, ...rest }) => {
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
        GUESTCAM
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
