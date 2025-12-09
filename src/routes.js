// src/routes.js
import React from "react";
import { Icon } from "@chakra-ui/react";
import { MdHome, MdEvent } from "react-icons/md";

// Lazy-load pages to avoid circular import issues
const HorizonDashboard = React.lazy(() => import("./pages/HorizonDashboard"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const CreateEvent = React.lazy(() => import("./pages/CreateEvent"));
const EditEvent = React.lazy(() => import("./pages/EditEvent"));
const Event = React.lazy(() => import("./pages/Event"));
const Gallery = React.lazy(() => import("./pages/Gallery"));
const GuestGallery = React.lazy(() => import("./pages/GuestGallery"));
const Videos = React.lazy(() => import("./pages/Videos"));
const GuestVideos = React.lazy(() => import("./pages/GuestVideos"));
const Guestbook = React.lazy(() => import("./pages/Guestbook"));
const LiveSlideshow = React.lazy(() => import("./pages/LiveSlideshow"));
const GuestDashboard = React.lazy(() => import("./pages/GuestDashboard"));
const DashboardSE = React.lazy(() => import("./pages/DashboardSE"));
const CanvaTemplates = React.lazy(() => import("./pages/CanvaTemplates"));

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "/dashboard",
    icon: <Icon as={MdHome} w="20px" h="20px" color="inherit" />,
    component: DashboardSE,
  },
  {
    path: "/guest-dashboard/:id",
    name: "Guest Dashboard",
    layout: "/admin",
    component: GuestDashboard,
  },
  {
    name: "Create Event",
    layout: "/admin",
    path: "/create-event",
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: CreateEvent,
  },
  {
    name: "Edit Event",
    layout: "/admin",
    path: "/edit-event/:id",
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: EditEvent,
  },
  {
    name: "Event",
    layout: "/admin",
    path: "/events/:id",
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: Event,
  },

  // Gallery
  {
    name: "Gallery (Owner)",
    layout: "/admin",
    path: "/gallery/owner/:id",
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: Gallery,
  },
  {
    name: "Gallery (Guest)",
    layout: "/admin",
    path: "/gallery/guest/:id",
    icon: <Icon as={MdEvent} w="20px" h="20px" color="inherit" />,
    component: GuestGallery,
  },

  // Videos
  {
    path: "/videos/owner/:id",
    name: "Owner Videos",
    layout: "/admin",
    component: Videos,
  },
  {
    path: "/videos/guest/:id",
    name: "Guest Videos",
    layout: "/admin",
    component: GuestVideos,
  },

  // Guestbook
  {
    path: "/guestbook/owner/:id",
    name: "Owner Guestbook",
    layout: "/admin",
    component: Guestbook,
  },
  {
    path: "/guestbook/guest/:id",
    name: "Guest Guestbook",
    layout: "/admin",
    component: Guestbook,
  },

  // Live Slideshow
  {
    path: "/slideshow/:id",
    name: "Live Slideshow",
    layout: "/admin",
    component: LiveSlideshow,
  },
  {
    path: "/slideshow/:id/kiosk",
    name: "Live Slideshow (Kiosk)",
    layout: "/admin",
    component: LiveSlideshow,
  },
  {
    path: "/slideshow/:id/embed",
    name: "Live Slideshow (Embed)",
    layout: "/admin",
    component: LiveSlideshow,
  },
  {
    path: "/canvatemplates",
    name: "Canva Templates",
    layout: "/admin",
    component: CanvaTemplates,
  },
];

export default routes;
