// src/routes.js
import React from "react";
import { Icon } from "@chakra-ui/react";
import { MdHome, MdEvent } from "react-icons/md";

// Pages
import HorizonDashboard from "./pages/HorizonDashboard";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import Event from "./pages/Event";
import Gallery from "./pages/Gallery";
import GuestGallery from "./pages/GuestGallery";
import Videos from "./pages/Videos";
import GuestVideos from "./pages/GuestVideos";
import Guestbook from "./pages/Guestbook";
import LiveSlideshow from "./pages/LiveSlideshow";
import GuestDashboard from "./pages/GuestDashboard";

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "/dashboard",
    icon: <Icon as={MdHome} w="20px" h="20px" color="inherit" />,
    component: <Dashboard />,
  },
  {
  path: "/guest-dashboard/:id",
  name: "Guest Dashboard",
  layout: "/admin",
  component: <GuestDashboard />,
},
  {
    name: "Create Event",
    layout: "/admin",
    path: "/create-event",
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <CreateEvent />,
  },
  {
    name: "Edit Event",
    layout: "/admin",
    path: "/edit-event/:id",
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <EditEvent />,
  },
  {
    name: "Event",
    layout: "/admin",
    path: "/events/:id",
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <Event />,
  },

  // 🔹 Gallery Routes
  {
    name: "Gallery (Owner)",
    layout: "/admin",
    path: "/gallery/owner/:id",
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <Gallery />,
  },
  {
    name: "Gallery (Guest)",
    layout: "/admin",
    path: "/gallery/guest/:id",
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: <GuestGallery />,
  },

  // 🔹 Videos Routes
  {
    path: "/videos/owner/:id",
    name: "Owner Videos",
    layout: "/admin",
    component: <Videos allowUpload={true} />,
  },
  {
    path: "/videos/guest/:id",
    name: "Guest Videos",
    layout: "/admin",
    component: <GuestVideos />,
  },

  // 🔹 Guestbook Routes
  {
    path: "/guestbook/owner/:id",
    name: "Owner Guestbook",
    layout: "/admin",
    component: <Guestbook guestMode={false} allowUpload={true} />,
  },
  {
    path: "/guestbook/guest/:id",
    name: "Guest Guestbook",
    layout: "/admin",
    component: <Guestbook />,
  },

  // 🔹 Live Slideshow Routes
  {
    path: "/slideshow/:id",
    name: "Live Slideshow",
    layout: "/admin",
    component: <LiveSlideshow />,
  },
  {
    path: "/slideshow/:id/kiosk",
    name: "Live Slideshow (Kiosk)",
    layout: "/admin",
    component: <LiveSlideshow kiosk />,
  },
  {
    path: "/slideshow/:id/embed",
    name: "Live Slideshow (Embed)",
    layout: "/admin",
    component: <LiveSlideshow embed />,
  },
];

export default routes;
