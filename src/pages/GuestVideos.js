// src/pages/GuestVideos.js
import React from "react";
import Videos from "./Videos";
import { useAuthContext } from "../hooks/useAuthContext";

/**
 * GuestVideos wrapper
 * - Controls whether guests can upload (allowUpload)
 */
export default function GuestVideos() {
  const { user } = useAuthContext();

  // allow uploads by default for guests. Change to false if you want to block anonymous uploads.
  const allowUpload = true;

  return <Videos allowUpload={allowUpload} />;
}
