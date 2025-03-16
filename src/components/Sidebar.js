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
  Spacer,
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
import {MdEvent} from "react-icons/md";
import {AiOutlinePrinter} from "react-icons/ai";
import {IoMdPhotos} from "react-icons/io";
import { BiSolidVideos, BiBookHeart } from "react-icons/bi";
import { CalendarIcon, SettingsIcon } from "@chakra-ui/icons";
import { IconType } from "react-icons";
import { ReactText } from "react";
import { AvatarInfo } from "./AvatarInfo";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useHistory, Link } from "react-router-dom";
import { useEvent } from "../hooks/useEvent";
import { useUserInfo } from "../hooks/useUserInfo";
import { AvatarInfo_Mobile } from "./AvatarInfo_Mobile";
import { HomeIcon } from "chakra-ui-ionicons";

const LinkItems = [
  { name: "Home", icon: FiHome, url: "/dashboard" },
  { name: "Create Event", icon: MdEvent, url: "/newevent" },
  { name: "Print Materials", icon: AiOutlinePrinter, url: "/canvatemplates" },
  { name: "Settings", icon: FiSettings, url: "/dashboard" },
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
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent role={role} eventId={eventId} onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav
        role={role}
        eventId={eventId}
        display={{ base: "flex", md: "none" }}
        onOpen={onOpen}
      />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
}

const SidebarContent = ({ eventId, role, onClose, ...rest }) => {
  const LinkItems_Guest = [
    {
      name: "Home",
      icon: FiHome,
      url: `/Guest/Dashboard/${eventId}`,
    },
    { name: "Photos", icon: IoMdPhotos, url: `/gallery/${role}/${eventId}` },
    { name: "Videos", icon: BiSolidVideos, url: `/videos/${role}/${eventId}` },
    {
      name: "GuestBook",
      icon: BiBookHeart,
      url: `/guestbook/${role}/${eventId}`,
    },
  ];
  const EventLinks = [
    {
      name: "Photos",
      icon: IoMdPhotos,
      url: `/gallery/${role}/${eventId}`,
    },
    {
      name: "Videos",
      icon: BiSolidVideos,
      url: `/videos/${role}/${eventId}`,
    },
    {
      name: "GuestBook",
      icon: BiBookHeart,
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

const MobileNav = ({ role, eventId, onOpen, ...rest }) => {
  const LinkItems_Guest = [
    {
      name: "Home",
      icon: FiHome,
      url: `/Guest/Dashboard/${eventId}`,
    },
    {
      name: "Photos",
      icon: FiTrendingUp,
      url: `/gallery/${role}/${eventId}`,
    },
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
  let history = useHistory();
  return (
    <>
      <Flex
        ml={{ base: 0, md: 60 }}
        px={{ base: 4, md: 24 }}
        height="20"
        alignItems="center"
        bg={useColorModeValue("white", "gray.900")}
        borderBottomWidth="1px"
        borderBottomColor={"gray.200"}
        justifyContent="flex-start"
        {...rest}
      >
        {/* <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<FiMenu />}
      /> */}

        <Text fontSize="2xl" mt={"10px"} mr="8" fontFamily="monospace" fontWeight="bold">
          GUESTCAM
        </Text>
        <Spacer />
        <AvatarInfo_Mobile></AvatarInfo_Mobile>
      </Flex>

      {role == "Admin" && (
        <Flex
          ml={{ base: 0, md: 60 }}
          px={{ base: 4, md: 24 }}
          height="20"
          alignItems="center"
          bg={"white"}
          borderBottomWidth="1px"
          borderBottomColor={"gray.200"}
          justifyContent="flex-start"
          {...rest}
        >
          <IconButton
            aria-label="Home"
            onClick={() => {
              history.push(`/dashboard`);
            }}
            icon={<HomeIcon />}
          />
          {/* <Button
            px={2}
            mx={2}
            bg={"#151f21"}
            color={"white"}
            rounded={"md"}
            width={"100%"}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            onClick={() => {
              history.push(`/`);
            }}
          >
            Home
          </Button> */}
          <Button
            px={2}
            mx={2}
            // bg={"#151f21"}
            // color={"white"}
            rounded={"md"}
            width={"100%"}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            onClick={() => {
              history.push(`/newevent`);
            }}
          >
            New Event
          </Button>
          <Button
            px={2}
            mx={2}
            // bg={"#151f21"}
            // color={"white"}
            rounded={"md"}
            width={"100%"}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            onClick={() => {
              history.push(`/canvatemplates`);
            }}
          >
            Print Materials
          </Button>
          <IconButton
            aria-label="Home"
            onClick={() => {
              history.push(`/`);
            }}
            icon={<SettingsIcon />}
          />
        </Flex>
      )}
      {(role == "Admin" || role == "Guest") && eventId && (
        <Flex
          ml={{ base: 0, md: 60 }}
          px={{ base: 4, md: 24 }}
          height="20"
          alignItems="center"
          bg={"white"}
          borderBottomWidth="1px"
          borderBottomColor={"gray.200"}
          justifyContent="flex-start"
          {...rest}
        >
          {role == "Guest" && (
            <Button
              px={2}
              mx={2}
              bg={"#151f21"}
              color={"white"}
              rounded={"md"}
              width={"100%"}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
              }}
              onClick={() => {
                history.push(`/Guest/Dashboard/${eventId}`);
              }}
            >
              Welcome
            </Button>
          )}
          <Button
            px={2}
            mx={2}
            bg={"#151f21"}
            color={"white"}
            rounded={"md"}
            width={"100%"}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            onClick={() => {
              history.push(`/gallery/${role}/${eventId}`);
            }}
          >
            Photos
          </Button>
          <Button
            px={2}
            mx={2}
            bg={"#151f21"}
            color={"white"}
            rounded={"md"}
            width={"100%"}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            onClick={() => {
              history.push(`/videos/${role}/${eventId}`);
            }}
          >
            Videos
          </Button>
          <Button
            px={2}
            mx={2}
            bg={"#151f21"}
            color={"white"}
            rounded={"md"}
            width={"100%"}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            onClick={() => {
              history.push(`/guestbook/${role}/${eventId}`);
            }}
          >
            Guestbook
          </Button>
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
      )}
    </>
  );
};
