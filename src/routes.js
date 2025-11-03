import React from "react";
import { Icon } from "@chakra-ui/react";
import { MdHome, MdEvent } from "react-icons/md";

// Horizon layout page
import HorizonDashboard from "./pages/HorizonDashboard";

// Your actual events dashboard page
import Dashboard from "./pages/Dashboard"; // ✅ this is your event list page
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import Event from "./pages/Event";
import Gallery from "./pages/Gallery";
import Videos from "./pages/Videos";
import Guestbook from "./pages/Guestbook";

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "/dashboard", // final URL = /admin/dashboard
    icon: <Icon as={MdHome} w="20px" h="20px" color="inherit" />,
    component: <Dashboard />,
  },
  {
    name: "Create Event",
    layout: "/admin",
    path: "/create-event", // final URL = /admin/create-event
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <CreateEvent />,
  },
  {
    name: "Edit Event",
    layout: "/admin",
    path: "/edit-event/:id", // final URL = /admin/create-event
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <EditEvent />,
  },
  {
    name: "Event",
    layout: "/admin",
    path: "/events/:id", // final URL = /admin/create-event
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <Event />,
  },
  {
    name: "Gallery",
    layout: "/admin",
    path: "/gallery/:userType/:id", // final URL = /admin/create-event
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <Gallery />,
  },
  {
    name: "Videos",
    layout: "/admin",
    path: "/videos/:userType/:id", // final URL = /admin/create-event
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <Videos />,
  },
  {
    name: "Guestbook",
    layout: "/admin",
    path: "/guestbook/:userType/:id", // final URL = /admin/create-event
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <Guestbook />,
  },
  {
    name: "Edit Event",
    layout: "/admin",
    path: "/edit-event/:id", // final URL = /admin/create-event
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <CreateEvent />,
  },

  {
    name: "Gallery",
    layout: "/admin",
    path: "/gallery/owner/:id", // final URL = /admin/create-event
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <Gallery />,
  },
  {
    name: "Videos",
    layout: "/admin",
    path: "/videos/:userType/:id", // final URL = /admin/create-event
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <Videos />,
  },
  {
    name: "Guestbook",
    layout: "/admin",
    path: "/guestbook/:userType/:id", // final URL = /admin/create-event
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <Guestbook />,
  },
  {
    name: "GuestGallery",
    layout: "/admin",
    path: "/gallery/guest/:id", // final URL = /admin/create-event
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <Gallery />,
  },
];

export default routes;
