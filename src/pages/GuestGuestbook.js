// src/pages/GuestGuestbook.js
import React from "react";
import Guestbook from "./Guestbook";
import { useAuthContext } from "../hooks/useAuthContext";

/**
 * GuestGuestbook
 * - For guest users (anonymous or signed-in).
 * - Guests can upload videos/text.
 * - Guests can delete only their own entries.
 * - Guests cannot download anything.
 */
export default function GuestGuestbook() {
  const { user } = useAuthContext();

  return <Guestbook guestMode={true} allowUpload={true} />;
}
