// src/pages/Event.js
import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useDocument } from "../hooks/useDocument";
import { useCollection } from "../hooks/useCollection"; // <-- new: get user's events
import { useUserInfo } from "../hooks/useUserInfo";
import { useEvent } from "../hooks/useEvent";
import { usePlan } from "../context/PlanContext";
import { useFirestore } from "../hooks/useFirestore";
import { useAuthContext } from "../hooks/useAuthContext";
import QRCode from "qrcode.react";
import {
  Box,
  Container,
  Image,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Badge,
  Progress,
  Divider,
  Stack,
  Grid,
  useColorModeValue,
  Center,
  Spinner,
  useBreakpointValue,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import {
  FaDownload,
  FaPrint,
  FaImages,
  FaVideo,
  FaBook,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { projectFirestore } from "../firebase/config";

console.log("[DEV CHECK] Event.js loaded at", new Date().toISOString());

/* Utility: Download QR Code */
const downloadQR = (canvasId = "qr-canvas") => {
  try {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "event-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("QR download failed", err);
  }
};

export default function EventPage() {
  const { id } = useParams(); // route id (may be undefined for this temporary flow)
  const history = useHistory();

  // ---------------------------
  // Top-level hooks (always here)
  // ---------------------------
  const { document, error } = useDocument("events", id); // event doc (if id present)
  const {
    documents: userEvents,
    error: userEventsError,
    isPending: userEventsPending,
  } = useCollection("events", ["adminId", "==", useAuthContext().user?.uid]); // fetch user's events (first event fallback)

  const { UserInfo } = useUserInfo();
  const { changeEvent } = useEvent();
  const { currentPlan } = usePlan();
  const { deleteDocument, updateDocument } = useFirestore("events");
  const { user } = useAuthContext();
  const toast = useToast();

  // color & responsive hooks (also top-level)
  const textColor = useColorModeValue("#1A1A1A", "#FFFFFF");
  const muted = useColorModeValue("gray.600", "gray.300");
  const cardBg = useColorModeValue("#FFFFFF", "#2B2B2B");
  const outerBg = useColorModeValue("#F3EDE4", "#120A18");

  const heroHeight = useBreakpointValue({
    base: "260px",
    md: "420px",
    lg: "480px",
  });
  const qrSize = useBreakpointValue({ base: 110, md: 150 });

  // layout refs & state (top-level)
  const heroRef = useRef(null);
  const floatingRef = useRef(null);
  const [mainContentMtPx, setMainContentMtPx] = useState(180);
  const [floatingTopPx, setFloatingTopPx] = useState(null);

  // delete dialog hooks (top-level)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const cancelRef = useRef();
  const [isDeleting, setIsDeleting] = useState(false); // <-- NEW

  // ---------------------------
  // Layout measurement effect
  // ---------------------------
  useLayoutEffect(() => {
    const recalc = () => {
      const heroEl = heroRef.current;
      const floatEl = floatingRef.current;

      // default desktop fallback
      if (!heroEl || !floatEl) {
        setFloatingTopPx(null);
        setMainContentMtPx(180);
        return;
      }

      const heroRect = heroEl.getBoundingClientRect();
      const floatRect = floatEl.getBoundingClientRect();

      // compute top for mobile floating card
      const basePercent = 0.62;
      let computedTop = Math.round(heroRect.height * basePercent);

      const minTop = Math.round(heroRect.height * 0.48);
      const maxTop = Math.round(heroRect.height * 0.75);
      computedTop = Math.max(minTop, Math.min(maxTop, computedTop));

      const safeTopMinPx = 56;
      computedTop = Math.max(computedTop, safeTopMinPx);

      const multiplier = 0.6;
      const buffer = 4;
      const computedMainMt = Math.round(
        computedTop + floatRect.height * multiplier + buffer
      );

      const minSafeMainMt = 150;

      // apply
      setFloatingTopPx(computedTop);
      setMainContentMtPx(Math.max(computedMainMt, minSafeMainMt));
    };

    // run now
    recalc();

    // debounce on resize/orientation change
    let t = null;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(recalc, 80);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      clearTimeout(t);
    };
  }, [heroRef, floatingRef, document?.featureImage, document?.eventName]);

  // ensure current event context is set
  useEffect(() => {
    if (id) changeEvent(id);
  }, [id, changeEvent]);

  // ---------------------------
  // TEMP: If no id provided, redirect to first event (if exists)
  // ---------------------------
  useEffect(() => {
    // wait until we have userEvents and user
    if (id) return; // route already has an id — do nothing
    if (!user) return; // need authenticated user
    if (userEventsPending) return; // still loading
    if (userEventsError) return; // problem fetching events

    if (Array.isArray(userEvents) && userEvents.length > 0) {
      // redirect to the first event's page
      const first = userEvents[0];
      if (first?.id) {
        history.replace(`/admin/events/${first.id}`);
      }
    }
    // if no events, we won't redirect — UI below will show "create event" button
  }, [id, user, userEvents, userEventsPending, userEventsError, history]);

  // ---------------------------
  // Owner check (derived)
  // ---------------------------
  const normalize = (x) => (typeof x === "string" ? x.trim().toLowerCase() : x);
  const eventOwnerId =
    normalize(document?.adminId) ||
    normalize(document?.createdBy?.id) ||
    normalize(document?.createdBy?.uid);
  const isOwner = !!(
    eventOwnerId &&
    user?.uid &&
    eventOwnerId === normalize(user.uid)
  );

  // Redirect non-owners to guest view with a toast (friendly)
  useEffect(() => {
    // wait for resolution
    if (typeof document === "undefined" || typeof user === "undefined") return;

    if (document && !isOwner) {
      toast({
        title: "Redirecting",
        description: "You are not the owner — taking you to the guest view.",
        status: "info",
        duration: 1200,
        isClosable: false,
        position: "top-right",
      });
      setTimeout(() => {
        history.replace(`/guest_login/${id}`);
      }, 1200);
    }
  }, [document, user, isOwner, toast, history, id]);

  // ---------------------------
  // Early returns (safe: all hooks already declared)
  // ---------------------------
  if (userEventsPending) {
    return (
      <Center minH="60vh" pt="120px">
        <VStack>
          <Spinner size="xl" />
          <Text>Checking your events…</Text>
        </VStack>
      </Center>
    );
  }

  // if there are no events (userEvents empty) and no route id, show create CTA
  const userHasNoEvents = Array.isArray(userEvents) && userEvents.length === 0;

  if (!id && userHasNoEvents) {
    return (
      <Center minH="60vh" pt="120px">
        <VStack spacing={6}>
          <Heading size="lg">You don't have an event yet</Heading>
          <Text color="gray.600">Create your first event to get started.</Text>
          <Button
            colorScheme="yellow"
            bg="#C7B299"
            color="#1E0F26"
            onClick={() => history.push("/admin/create-event")}
            _hover={{ bg: "#a7833f" }}
          >
            Create New Event
          </Button>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center minH="60vh" pt="120px">
        <Text color="red.500">Error: {String(error)}</Text>
      </Center>
    );
  }

  if (!document || typeof user === "undefined") {
    return (
      <Center minH="60vh" pt="120px">
        <VStack>
          <Spinner size="xl" />
          <Text>Loading event…</Text>
        </VStack>
      </Center>
    );
  }

  // fallback (shouldn't usually show because of redirect)
  if (!isOwner) {
    return (
      <Center minH="60vh" pt="120px">
        <VStack spacing={4}>
          <Heading size="md">Not authorized</Heading>
          <Text>
            You are not the owner of this event. Redirecting to guest view…
          </Text>
        </VStack>
      </Center>
    );
  }

  // ---------------------------
  // Derived/app values
  // ---------------------------
  const guestLimit = currentPlan?.NoOfGuests_end ?? "Unlimited";
  const progressValue = currentPlan?.NoOfGuests_end
    ? Math.min((document.noOfGuests / currentPlan.NoOfGuests_end) * 100, 100)
    : 0;

  // color palette used across buttons
  const COLORS = {
    deepPurple: "#1E0F26",
    softPurple: "#2B183B",
    mutedGold: "#C7B299",
    lightBeige: "#E9E1D3",
  };

  // button style presets
  const qrButtonSolid = {
    bg: COLORS.mutedGold,
    color: COLORS.deepPurple,
    borderRadius: "full",
    px: 6,
    py: 2.5,
    fontWeight: 700,
    _hover: {
      bg: COLORS.softPurple,
      color: "#fff",
      transform: "translateY(-2px)",
    },
  };
  const qrButtonOutline = {
    variant: "outline",
    borderWidth: "2px",
    borderColor: COLORS.mutedGold,
    color: COLORS.deepPurple,
    borderRadius: "full",
    px: 6,
    py: 2.5,
    fontWeight: 700,
    _hover: { bg: COLORS.lightBeige, transform: "translateY(-2px)" },
  };
  const actionButton = {
    borderRadius: "full",
    fontWeight: 800,
    py: 5,
    fontSize: "md",
    color: "#fff",
    bgGradient: `linear(to-r, ${COLORS.softPurple}, ${COLORS.deepPurple})`,
    boxShadow: "0 6px 16px rgba(30,15,38,0.25)",
    _hover: {
      bgGradient: `linear(to-r, ${COLORS.deepPurple}, ${COLORS.softPurple})`,
      transform: "translateY(-3px)",
      boxShadow: "0 10px 24px rgba(30,15,38,0.35)",
    },
  };
  const actionOutline = {
    border: `2px solid ${COLORS.mutedGold}`,
    color: COLORS.deepPurple,
    fontWeight: 700,
    borderRadius: "full",
    py: 5,
    _hover: { bg: COLORS.lightBeige, transform: "translateY(-3px)" },
  };
  const actionGold = {
    bgGradient: `linear(to-r, ${COLORS.mutedGold}, ${COLORS.lightBeige})`,
    color: COLORS.deepPurple,
    borderRadius: "full",
    fontWeight: 800,
    py: 5,
    _hover: {
      transform: "translateY(-3px)",
      boxShadow: "0 10px 24px rgba(199,178,153,0.4)",
    },
  };

  // ---------------------------
  // Delete/Archive behavior (safe client timestamp used)
  // ---------------------------
  const openDeleteDialog = () => setIsDeleteOpen(true);
  const closeDeleteDialog = () => {
    if (!isDeleting) setIsDeleteOpen(false);
  };

  const handleConfirmDelete = async () => {
    // Immediately show deleting state and close dialog
    setIsDeleting(true);
    setIsDeleteOpen(false);

    try {
      if (!document?.id) throw new Error("No event selected to delete.");
      const eventId = document.id;

      // 1) Try soft-delete first (update)
      if (typeof updateDocument === "function") {
        try {
          const updated = await updateDocument(eventId, {
            deleted: true,
            deletedAt: new Date(),
            deletedBy: user?.uid || null,
          });

          // updateDocument is expected to return the updated document object.
          console.log("updateDocument returned:", updated);

          // 1.a) Read the document directly from Firestore to verify the field was written
          const snap = await projectFirestore
            .collection("events")
            .doc(eventId)
            .get();
          if (!snap.exists) {
            // Document missing after update — treat as success or fallback to deletion
            console.warn(
              "After update, document no longer exists in Firestore."
            );
            toast({
              title: "Event removed",
              description: "Event no longer exists after archive attempt.",
              status: "success",
              duration: 3000,
              isClosable: true,
              position: "top-right",
            });
            setIsDeleting(false);
            history.replace("/admin/dashboard");
            return;
          }

          const data = snap.data();
          console.log("Document after update check:", data);

          if (data && data.deleted === true) {
            // Verified — soft-delete applied
            toast({
              title: "Event archived",
              description: "The event was archived (soft-deleted).",
              status: "success",
              duration: 3000,
              isClosable: true,
              position: "top-right",
            });
            setIsDeleting(false);
            history.replace("/admin/dashboard");
            return;
          } else {
            // Update call succeeded (didn't throw) but the field isn't present — possible rules/transpile issue
            console.warn(
              "Soft-delete update did not write deleted:true — attempting hard delete fallback."
            );
            toast({
              title: "Archive incomplete",
              description:
                "Archiving didn't persist. Attempting permanent delete fallback.",
              status: "warning",
              duration: 4000,
              isClosable: true,
              position: "top-right",
            });
          }
        } catch (updateErr) {
          // updateDocument threw — possibly permission issue
          console.error(
            "Soft-delete (updateDocument) threw an error:",
            updateErr
          );
          // Surface friendly toast but continue to fallback
          if (/permission-denied/i.test(String(updateErr?.message || ""))) {
            toast({
              title: "Permission denied",
              description:
                "You don't have permission to archive this event. Attempting permanent delete fallback (may also fail).",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "top-right",
            });
          } else {
            toast({
              title: "Archive failed",
              description: "Archiving failed, attempting permanent delete.",
              status: "warning",
              duration: 5000,
              isClosable: true,
              position: "top-right",
            });
          }
          console.warn("Falling through to hard-delete fallback.");
        }
      }

      // 2) Hard-delete fallback: try to delete the document
      if (typeof deleteDocument === "function") {
        try {
          const res = await deleteDocument(eventId);
          console.log("deleteDocument returned:", res);
          if (res && res.success) {
            toast({
              title: "Event deleted",
              description: "The event has been permanently deleted.",
              status: "success",
              duration: 3000,
              isClosable: true,
              position: "top-right",
            });
            setIsDeleting(false);
            history.replace("/admin/dashboard");
            return;
          } else {
            // deleteDocument returned an error object or falsy result
            const errMsg = res?.error || "Unknown error during deletion.";
            throw new Error(errMsg);
          }
        } catch (deleteErr) {
          console.error("Hard delete failed:", deleteErr);
          if (/permission-denied/i.test(String(deleteErr?.message || ""))) {
            toast({
              title: "Permission denied",
              description:
                "You don't have permission to delete this event. Check Firestore rules or event ownership.",
              status: "error",
              duration: 6000,
              isClosable: true,
              position: "top-right",
            });
          } else {
            toast({
              title: "Delete failed",
              description:
                deleteErr?.message ||
                "Could not delete the event. See console for details.",
              status: "error",
              duration: 6000,
              isClosable: true,
              position: "top-right",
            });
          }
          setIsDeleting(false);
          return;
        }
      }

      // 3) If no updateDocument/deleteDocument available
      throw new Error("Delete/Archive functions not available.");
    } catch (err) {
      console.error("Delete/Archive flow failed:", err);
      toast({
        title: "Delete failed",
        description: err.message || "Could not delete the event. Try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
      setIsDeleting(false);
    }
  };

  const handleEdit = () => history.push(`/admin/edit-event/${document.id}`);

  // ---------------------------
  // Render owner UI
  // ---------------------------
  return (
    <Box as="main" w="100%" bg={outerBg} mt="92px" minH="100vh">
      {/* HERO / FEATURE IMAGE */}
      <Box ref={heroRef} position="relative" w="100%" h={heroHeight}>
        <Image
          src={document.featureImage}
          alt={document.eventName}
          objectFit="cover"
          w="100%"
          h="100%"
        />

        {/* FLOATING EVENT CARD */}
        <Container
          ref={floatingRef}
          maxW={{ base: "95%", md: "1000px" }}
          px={{ base: 4, md: 8 }}
          position="absolute"
          top={floatingTopPx !== null ? `${floatingTopPx}px` : undefined}
          bottom={floatingTopPx === null ? { md: "-120px" } : undefined}
          left="50%"
          transform="translateX(-50%)"
          mb={{ base: 6, md: 0 }}
          zIndex={{ base: 50, md: 20 }}
        >
          <Box
            bg={cardBg}
            boxShadow="2xl"
            rounded="2xl"
            p={{ base: 5, md: 8 }}
            border="1px solid"
            borderColor="rgba(0,0,0,0.04)"
          >
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {/* LEFT: QR */}
              <VStack align="center" spacing={4}>
                <Heading
                  size="md"
                  color={textColor}
                  textAlign="center"
                  fontWeight="700"
                >
                  Guestdd Photos & Digital Guestbook
                </Heading>

                <QRCode
                  id="qr-canvas"
                  value={`https://guestpov.ca/guest_login/${id}`}
                  size={qrSize}
                  fgColor={COLORS.deepPurple}
                />

                <HStack spacing={4} mt={3} flexWrap="wrap" justify="center">
                  <Button
                    leftIcon={<FaDownload />}
                    {...qrButtonSolid}
                    size="sm"
                    onClick={() => downloadQR("qr-canvas")}
                  >
                    Download QR
                  </Button>

                  <Button
                    leftIcon={<FaPrint />}
                    {...qrButtonOutline}
                    size="sm"
                    onClick={() => window.print()}
                  >
                    Print
                  </Button>
                </HStack>
              </VStack>

              {/* RIGHT: DETAILS */}
              <VStack align="start" spacing={4}>
                <Heading fontSize="2xl" fontWeight="700" color={textColor}>
                  {document.eventName}
                </Heading>

                <HStack spacing={3} flexWrap="wrap" alignItems="center">
                  <Text color={muted}>
                    Date of Event:{" "}
                    <Text as="span" fontWeight="600" color={COLORS.softPurple}>
                      {document.dateOfEvent.toDate().toDateString()}
                    </Text>
                  </Text>

                  <Text color={muted}>
                    Site Closes:{" "}
                    <Text as="span" fontWeight="600" color={COLORS.softPurple}>
                      {document.siteCloses.toDate().toDateString()}
                    </Text>
                  </Text>

                  <Badge
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg="#D1FADF"
                    color="#027A48"
                  >
                    {document.siteStatus}
                  </Badge>
                </HStack>

                <Box>
                  <Text color={COLORS.mutedGold} fontWeight="700" mb={1}>
                    {document.eventPageHeader}
                  </Text>
                  <Text color={muted} fontSize="sm">
                    {document.welcomeMessage}
                  </Text>
                </Box>

                <Box w="100%">
                  <HStack justify="space-between">
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      color={COLORS.softPurple}
                    >
                      Guests
                    </Text>
                    <Text fontSize="sm" fontWeight="600">
                      {document.noOfGuests}/{guestLimit}
                    </Text>
                  </HStack>

                  <Progress
                    mt={1}
                    size="sm"
                    borderRadius="md"
                    value={progressValue}
                    sx={{
                      "& > div": {
                        background: `linear-gradient(90deg, ${COLORS.mutedGold}, ${COLORS.softPurple})`,
                      },
                    }}
                  />
                </Box>
              </VStack>
            </SimpleGrid>

            {/* Action row */}
            <Box mt={6}>
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(5, 1fr)" }}
                gap={4}
              >
                <Button
                  leftIcon={<FaImages />}
                  {...actionButton}
                  onClick={() =>
                    history.push(
                      `/admin/gallery/${UserInfo.role}/${document.id}`
                    )
                  }
                >
                  Photos
                </Button>

                <Button
                  leftIcon={<FaVideo />}
                  {...actionOutline}
                  onClick={() =>
                    history.push(`/videos/${UserInfo.role}/${document.id}`)
                  }
                >
                  Videos
                </Button>

                <Button
                  leftIcon={<FaBook />}
                  {...actionGold}
                  onClick={() =>
                    history.push(`/guestbook/${UserInfo.role}/${document.id}`)
                  }
                >
                  Guestbook
                </Button>

                {/* spacer */}
                <Box />

                {/* Edit / Delete */}
                <HStack spacing={3} justify="flex-end">
                  <Button
                    leftIcon={<FaEdit />}
                    onClick={handleEdit}
                    rounded="full"
                    px={5}
                    fontWeight="700"
                    bg={COLORS.softPurple}
                    color="#fff"
                    _hover={{ bg: COLORS.deepPurple }}
                  >
                    Edit
                  </Button>

                  <Button
                    leftIcon={<FaTrash />}
                    onClick={openDeleteDialog}
                    rounded="full"
                    px={5}
                    fontWeight="700"
                    bg="transparent"
                    border={`2px solid rgba(220,38,38,0.12)`}
                    color="red.500"
                    _hover={{ bg: "rgba(255,0,0,0.04)" }}
                  >
                    Delete
                  </Button>
                </HStack>
              </Grid>

              {/* DEBUG: temporary direct-check buttons (remove later) */}
              <Box
                mt={4}
                p={3}
                bg="rgba(255,255,255,0.95)"
                boxShadow="md"
                borderRadius="md"
                zIndex={60}
              >
                <Text fontSize="sm" mb={2} fontWeight={700}>
                  DEBUG: direct Firestore checks
                </Text>
                <HStack spacing={3}>
                  <Button
                    colorScheme="orange"
                    onClick={async () => {
                      console.log(
                        "DEBUG: attempting direct update (soft-delete)..."
                      );
                      try {
                        const eventId = document?.id;
                        if (!eventId) return console.warn("no document id");
                        await projectFirestore
                          .collection("events")
                          .doc(eventId)
                          .update({
                            deleted: true,
                            deletedAt: new Date(),
                            deletedBy: user?.uid || null,
                          });
                        console.log("DEBUG: update() succeeded");
                        const snap = await projectFirestore
                          .collection("events")
                          .doc(eventId)
                          .get();
                        console.log(
                          "DEBUG: after update check:",
                          snap.exists ? snap.data() : "doc missing"
                        );
                      } catch (err) {
                        console.error("DEBUG: update() error:", err);
                      }
                    }}
                  >
                    Debug: try soft-delete
                  </Button>

                  <Button
                    colorScheme="red"
                    onClick={async () => {
                      console.log(
                        "DEBUG: attempting direct delete (hard-delete)..."
                      );
                      try {
                        const eventId = document?.id;
                        if (!eventId) return console.warn("no document id");
                        await projectFirestore
                          .collection("events")
                          .doc(eventId)
                          .delete();
                        console.log("DEBUG: delete() succeeded");
                      } catch (err) {
                        console.error("DEBUG: delete() error:", err);
                      }
                    }}
                  >
                    Debug: try hard-delete
                  </Button>

                  <Button
                    colorScheme="gray"
                    onClick={() => {
                      console.log("DEBUG: document in memory:", document);
                      alert("Check console for the document object (DEBUG).");
                    }}
                  >
                    Debug: show doc
                  </Button>
                </HStack>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* MAIN CONTENT BELOW */}
      <Container
        maxW="1000px"
        px={{ base: 4, md: 8 }}
        mt={`${mainContentMtPx}px`}
        pb={10}
      >
        <Stack spacing={6}>
          <Divider />
          <Box>
            <Text fontSize="sm" color={muted}>
              <i>
                Tip: Open the QR link in another browser window to test guest
                and admin access simultaneously.
              </i>
            </Text>
          </Box>
        </Stack>
      </Container>

      {/* Delete confirmation AlertDialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDeleteDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete event
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This action will archive the event (soft-delete) if
              available, otherwise it will permanently delete it. This cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={closeDeleteDialog}
                isDisabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDelete}
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Yes, delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
