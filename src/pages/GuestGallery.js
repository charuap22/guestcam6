// src/pages/GuestGallery.js
import React from "react";
import Gallery from "./Gallery";
import { useAuthContext } from "../hooks/useAuthContext";

/**
 * GuestGallery
 * - Allows guest users (anonymous or logged-in) to view and upload photos.
 * - Reuses the main Gallery component with guestMode enabled.
 * - You can control `allowUpload` based on authentication or event settings.
 */
export default function GuestGallery() {
  const { user } = useAuthContext();

  // Allow upload for both guests and signed-in users
  // If you ever want to restrict guest uploads, change allowUpload to `!!user && !user.isAnonymous`
  const allowUpload = true;

  return <Gallery guestMode={true} allowUpload={allowUpload} />;
}
