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
    // ───────── OWNER ROUTES ─────────
    {
      name: "Dashboard",
      layout: "/admin",
      path: "/dashboard",
      component: DashboardSE,
      access: "owner",
    },
    {
      name: "Create Event",
      layout: "/admin",
      path: "/create-event",
      component: CreateEvent,
      access: "owner",
    },
    {
      name: "Edit Event",
      layout: "/admin",
      path: "/edit-event/:id",
      component: EditEvent,
      access: "owner",
    },
    {
      path: "/events/:id",
      layout: "/admin",
      component: Event,
      access: "owner",
    },
    {
      path: "/gallery/owner/:id",
      layout: "/admin",
      component: Gallery,
      access: "owner",
    },
    {
      path: "/videos/owner/:id",
      layout: "/admin",
      component: Videos,
      access: "owner",
    },
    {
      path: "/guestbook/owner/:id",
      layout: "/admin",
      component: Guestbook,
      access: "owner",
    },

    // ───────── GUEST ROUTES ─────────
    {
      path: "/guest-dashboard/:id",
      layout: "/admin",
      component: GuestDashboard,
      access: "guest",
    },
    {
      path: "/gallery/guest/:id",
      layout: "/admin",
      component: GuestGallery,
      access: "guest",
    },
    {
      path: "/videos/guest/:id",
      layout: "/admin",
      component: GuestVideos,
      access: "guest",
    },
    {
      path: "/guestbook/guest/:id",
      layout: "/admin",
      component: Guestbook,
      access: "guest",
    },

    // ───────── PUBLIC / MIXED ─────────
    {
      path: "/slideshow/:id",
      layout: "/admin",
      component: LiveSlideshow,
      access: "public",
    },
    {
      path: "/canvatemplates",
      layout: "/admin",
      component: CanvaTemplates,
      access: "owner",
    },
  ];


  export default routes;
