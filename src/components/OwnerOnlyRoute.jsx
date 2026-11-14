// src/components/OwnerOnlyRoute.jsx
import React, { useEffect, useState } from "react";
import { Route, Redirect, useParams } from "react-router-dom";
import { Flex, Spinner, Text } from "@chakra-ui/react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useDocument } from "../hooks/useDocument";

/**
 * Protects an owner-only route.
 *
 * Behavior:
 * - If still loading event/user -> show spinner
 * - If event not found -> redirect to /admin/dashboard
 * - If viewer is guest (no user) -> redirect to guest view
 * - If viewer is signed in but not owner -> redirect to /admin/access-denied
 * - If owner -> render the component
 *
 * Usage:
 * <OwnerOnlyRoute path="/admin/gallery/owner/:id" component={Gallery} />
 */
export default function OwnerOnlyRoute({ component: Component, ...rest }) {
  const { user } = useAuthContext();
  const { id } = useParams();
  const { document: eventDoc, error } = useDocument("events", id);

  const [isOwner, setIsOwner] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!eventDoc) {
      setChecking(!error);
      setIsOwner(false);
      return;
    }

    if (!user) {
      setIsOwner(false);
      setChecking(false);
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
      if (Object.prototype.hasOwnProperty.call(eventDoc, key)) {
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
    setChecking(false);
  }, [user, eventDoc, error]);

  if (checking) {
    return (
      <Flex minH="60vh" align="center" justify="center">
        <Spinner size="lg" color="#d4af37" />
        <Text ml={3}>Verifying ownership...</Text>
      </Flex>
    );
  }

  if (error || !eventDoc) {
    return <Redirect to="/admin/dashboard" />;
  }

  // If no user (guest) -> redirect to guest view for the same kind if possible
  // We try to infer the kind from rest.path (common patterns), else default to 'gallery'
  if (!user) {
    const path = rest.path || "";
    const kindMatch = path.match(/\/(gallery|videos|guestbook)\//);
    const kind = kindMatch ? kindMatch[1] : "gallery";
    return <Redirect to={`/admin/${kind}/guest/${id}`} />;
  }

  // signed-in but not owner -> AccessDenied
  if (!isOwner) {
    return <Redirect to={`/admin/access-denied`} />;
  }

  // owner -> render protected component
  return <Route {...rest} render={() => <Component />} />;
}
