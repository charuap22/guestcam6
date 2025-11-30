// src/components/DecisionRoute.jsx
import React, { useEffect, useState } from "react";
import { Spinner, Flex, Text } from "@chakra-ui/react";
import { Redirect, useParams } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useDocument } from "../hooks/useDocument";

/**
 * Decides whether current user should see guest or owner view.
 * Usage: /admin/gallery/:id  →  redirects to /admin/gallery/owner/:id or /admin/gallery/guest/:id
 */
export default function DecisionRoute({ kind = "gallery" }) {
  const { id } = useParams();
  const { user } = useAuthContext();
  const { document: eventDoc, error } = useDocument("events", id);

  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!user || !eventDoc) {
      setIsOwner(false);
      return;
    }

    const uid = user.uid;
    let ownerMatch = false;
    const candidates = [
      "createdBy",
      "createdByUid",
      "createdById",
      "ownerId",
      "ownerUid",
      "owner",
      "uid",
      "userId",
      "createdByUser",
    ];

    for (const key of candidates) {
      const v = eventDoc[key];
      if (typeof v === "string" && v === uid) {
        ownerMatch = true;
        break;
      }
      if (v && typeof v === "object") {
        if (v.uid === uid || v.id === uid || v.userId === uid) {
          ownerMatch = true;
          break;
        }
      }
    }

    if (!ownerMatch) {
      for (const v of Object.values(eventDoc)) {
        if (typeof v === "string" && v === uid) {
          ownerMatch = true;
          break;
        }
        if (v && typeof v === "object") {
          if (v.uid === uid || v.id === uid || v.userId === uid) {
            ownerMatch = true;
            break;
          }
        }
      }
    }

    setIsOwner(ownerMatch);
  }, [user, eventDoc]);

  if (!eventDoc && !error) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <Spinner size="xl" color="#d4af37" />
        <Text ml={3}>Checking access...</Text>
      </Flex>
    );
  }

  if (error || !eventDoc) {
    return <Redirect to="/admin/dashboard" />;
  }

  const target = isOwner
    ? `/admin/${kind}/owner/${id}`
    : `/admin/${kind}/guest/${id}`;

  return <Redirect to={target} />;
}
