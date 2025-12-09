// src/pages/DashboardSE.js
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import QRCode from "qrcode.react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
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
  Stack,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
} from "@chakra-ui/react";

import {
  FaDownload,
  FaImages,
  FaVideo,
  FaBook,
  FaEdit,
  FaTrash,
  FaArrowRight,
} from "react-icons/fa";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import { useAuthContext } from "../hooks/useAuthContext";
import { useCollection } from "../hooks/useCollection";
import { useFirestore } from "../hooks/useFirestore";
import { useEvent } from "../hooks/useEvent";
import { useUserInfo } from "../hooks/useUserInfo";

export default function DashboardSE() {
  const history = useHistory();
  const toast = useToast();

  const { user } = useAuthContext();
  const { documents: userEvents, isPending: userEventsPending } = useCollection(
    "events",
    ["adminId", "==", user?.uid]
  );

  // keep these for compatibility; we will use direct firebase writes for verification
  const { deleteDocument, updateDocument } = useFirestore("events");
  const { changeEvent } = useEvent();
  const { UserInfo } = useUserInfo();

  const heroHeight = useBreakpointValue({
    base: "auto",
    md: "620px",
    lg: "780px",
  });

  const qrSize = useBreakpointValue({ base: 110, sm: 130, md: 160 });

  const cardBg = useColorModeValue("white", "gray.800");
  const outerBg = useColorModeValue("#F3EDE4", "gray.900");
  const textColor = useColorModeValue("#111827", "white");
  const muted = useColorModeValue("gray.600", "gray.300");
  const editBtnBg = useColorModeValue("gray.200", "gray.700");
  const GRADIENT = "linear(to-r, #d4b483, #e5989b)";

  const [firstEvent, setFirstEvent] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const cancelRef = React.useRef();

  // prevent showing admin spinner while resolving guest redirect
  const [isRedirectingGuest, setIsRedirectingGuest] = useState(false);

  // brightness overlay alpha state (0..1)
  const [overlayAlpha, setOverlayAlpha] = useState(0.3);

  // ---------- EARLY GUEST REDIRECT ----------
  useEffect(() => {
    if (!user) return; // wait for auth state

    const redirectGuest = async () => {
      try {
        if (user.isAnonymous || UserInfo?.role === "guest") {
          setIsRedirectingGuest(true);

          // v8 firebase syntax
          const db = firebase.firestore();
          const guestDocRef = db.collection("guests").doc(user.uid);
          const guestSnap = await guestDocRef.get();

          if (guestSnap.exists) {
            const guestData = guestSnap.data();
            const eventId = guestData?.eventId;

            if (eventId) {
              history.replace(`/admin/guest-dashboard/${eventId}`);
              return;
            }
          }

          // fallback route if guest doc or eventId missing
          history.replace("/admin/guest-dashboard");
        }
      } catch (err) {
        console.error("Guest redirect failed:", err);
        setIsRedirectingGuest(false);
      }
    };

    redirectGuest();
  }, [user, UserInfo, history]);
  // ------------------------------------------

  // NEW: Test link confirmation state & ref
  const [isTestConfirmOpen, setIsTestConfirmOpen] = useState(false);
  const confirmRef = React.useRef();

  useEffect(() => {
    if (Array.isArray(userEvents) && userEvents.length > 0) {
      setFirstEvent(userEvents[0]);
      changeEvent(userEvents[0].id);
    }
  }, [userEvents, changeEvent]);

  const handleEdit = (id) => history.push(`/admin/edit-event/${id}`);
  // map role -> URL segment. Admin -> owner, otherwise use lower-cased role (fallback to "guest")
  const mapRoleForUrl = (role) => {
    if (!role) return "guest";
    const r = String(role).trim().toLowerCase();
    if (r === "admin" || r === "administrator") return "owner";
    return r;
  };

  const gotoGallery = (role, id) =>
    history.push(`/admin/gallery/${mapRoleForUrl(role)}/${id}`);
  const gotoVideos = (role, id) =>
    history.push(`/videos/${mapRoleForUrl(role)}/${id}`);
  const gotoGuestbook = (role, id) =>
    history.push(`/guestbook/${mapRoleForUrl(role)}/${id}`);

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas");
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "event-qr.png";
    link.click();
  };

  // ---------- ROBUST delete flow ----------
const confirmDelete = async () => {
  if (!firstEvent) return;

  setLoadingDelete(true);
  try {
    // ALWAYS delete the document fully
    const result = await deleteDocument(firstEvent.id);

    if (result?.error) {
      throw new Error(result.error);
    }

    toast({
      title: "Event deleted",
      description: "The event has been permanently removed.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // update local state so UI shows "No events yet"
    setFirstEvent(null);

    // clear selected event in global context (optional but recommended)
    try {
      changeEvent(null);
    } catch (e) {
      // if changeEvent expects a string id, handle accordingly; ignore if not available
      console.warn("changeEvent clear:", e);
    }

    setLoadingDelete(false);
    setIsDeleteOpen(false);
  } catch (err) {
    console.error("Delete failed:", err);
    toast({
      title: "Delete failed",
      description: err.message || "Could not delete the event.",
      status: "error",
      duration: 3500,
      isClosable: true,
    });
  } finally {
    setLoadingDelete(false);
    setIsDeleteOpen(false);
  }
};

  // ---------- end delete flow ----------

  // ------------------------------
  // Brightness detection & mapping
  // ------------------------------
  useEffect(() => {
    if (!firstEvent?.featureImage) {
      setOverlayAlpha(0.3);
      return;
    }

    let cancelled = false;

    const MIN_ALPHA = 0.18;
    const MAX_ALPHA = 0.55;
    const LUMINANCE_FLOOR = 60;
    const DEFAULT_ALPHA = 0.3;

    const analyze = async (imgUrl) => {
      try {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imgUrl;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error("Image load failed"));
        });

        const w = 100;
        const h = 100;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");

        const ratio = Math.max(img.width / w, img.height / h);
        const sw = Math.round(w * ratio);
        const sh = Math.round(h * ratio);

        ctx.drawImage(
          img,
          (img.width - sw) / 2,
          (img.height - sh) / 2,
          sw,
          sh,
          0,
          0,
          w,
          h
        );

        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        let total = 0;
        const len = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          total += lum;
        }
        const avg = total / len;

        const norm = Math.max(
          0,
          Math.min(1, (avg - LUMINANCE_FLOOR) / (255 - LUMINANCE_FLOOR))
        );
        const alpha = MIN_ALPHA + (MAX_ALPHA - MIN_ALPHA) * norm;

        if (!cancelled) {
          setOverlayAlpha(
            Number.isFinite(alpha) ? Number(alpha.toFixed(3)) : DEFAULT_ALPHA
          );
        }
      } catch (err) {
        console.warn(
          "Brightness analysis failed, using default overlay alpha:",
          err
        );
        if (!cancelled) setOverlayAlpha(DEFAULT_ALPHA);
      }
    };

    analyze(firstEvent.featureImage);

    return () => {
      cancelled = true;
    };
  }, [firstEvent?.featureImage]);

  // combine redirecting + admin-loading into a single loading flag
  const isLoading = isRedirectingGuest || userEventsPending;

  // Show a nice skeleton while redirect or loading admin events
  if (isLoading) {
    return (
      <Box
        as="main"
        bg={outerBg}
        mt={{ base: "130px", sm: "130px", md: "92px" }}
        minH="100vh"
      >
        {/* HERO SKELETON */}
        <Box
          position="relative"
          w="100%"
          h={heroHeight}
          overflow="visible"
          pt={{ base: 12, md: 0 }}
          pb={{ base: 6, md: 0 }}
        >
          <Container
            maxW={{
              base: "360px",
              sm: "420px",
              md: "90%",
              lg: "85%",
              xl: "80%",
            }}
            h="100%"
            position="relative"
            zIndex={5}
            display="flex"
            alignItems="center"
            pt={{ base: 4, md: 0 }}
          >
            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={{ base: 6, md: 12 }}
              w="100%"
              maxW="1100px"
              mx="auto"
            >
              {/* LEFT SKELETON */}
              <VStack
                align={{ base: "center", md: "flex-start" }}
                spacing={{ base: 6, md: 6 }}
                px={{ base: 3, md: 0 }}
                zIndex={7}
                width="100%"
              >
                <Box
                  w="100%"
                  p={{ base: 4, md: 0 }}
                  borderRadius={{ base: "18px", md: "0" }}
                  textAlign={{ base: "center", md: "left" }}
                >
                  <Skeleton
                    height="36px"
                    width={{ base: "80%", md: "520px" }}
                  />
                  <SkeletonText
                    mt={4}
                    noOfLines={3}
                    spacing="4"
                    width={{ base: "100%", md: "520px" }}
                  />
                </Box>

                {/* QR SKELETON */}
                <Box
                  display="flex"
                  w={{ base: "165px", sm: "180px", md: "260px" }}
                  h={{ base: "165px", sm: "180px", md: "260px" }}
                  alignItems="center"
                  justifyContent="center"
                  borderRadius={{ base: "22px", md: "12px" }}
                  p={{ base: 3, md: 0 }}
                >
                  <Skeleton height="100%" width="100%" borderRadius="12px" />
                </Box>

                {/* Buttons skeleton */}
                <Stack
                  direction={{ base: "column", md: "row" }}
                  spacing={{ base: 3, md: 4 }}
                  width="100%"
                  align={{ base: "stretch", md: "center" }}
                  mt={{ base: 3, md: 0 }}
                >
                  <Skeleton
                    height="48px"
                    width={{ base: "100%", md: "160px" }}
                  />
                  <Skeleton
                    height="48px"
                    width={{ base: "100%", md: "160px" }}
                  />
                  <Skeleton
                    height="48px"
                    width={{ base: "100%", md: "160px" }}
                  />
                </Stack>
              </VStack>

              {/* RIGHT CARD SKELETON */}
              <Box
                bg={cardBg}
                borderRadius="xl"
                boxShadow="lg"
                w="100%"
                maxW={{ base: "100%", md: "480px" }}
                p={{ base: 4, md: 6 }}
                display="flex"
                flexDirection="column"
                ml={{ base: 0, md: 6, lg: 12 }}
              >
                <Skeleton height="28px" width="60%" mb={3} />
                <SkeletonText noOfLines={1} mb={4} width="80%" />

                <Skeleton height="18px" width="30%" mb={2} />
                <SkeletonText noOfLines={1} mb={4} width="60%" />

                <Skeleton height="18px" width="30%" mb={2} />
                <SkeletonText noOfLines={1} mb={4} width="60%" />

                <Stack
                  direction={{ base: "column", md: "row" }}
                  spacing={3}
                  mt={2}
                  mb={4}
                >
                  <Skeleton height="44px" width="100px" />
                  <Skeleton height="44px" width="100px" />
                  <Skeleton height="44px" width="100px" />
                </Stack>

                <Box flex="1" />

                <HStack justifyContent="flex-end" spacing={3}>
                  <Skeleton height="40px" width="100px" />
                  <Skeleton height="40px" width="100px" />
                </HStack>
              </Box>
            </SimpleGrid>
          </Container>
        </Box>
      </Box>
    );
  }

  // If no events at all for admin
  if (!firstEvent)
    return (
      <Center minH="60vh" pt="120px">
        <VStack spacing={5}>
          <Heading>No events yet</Heading>
          <Button onClick={() => history.push("/admin/create-event")}>
            Create Event
          </Button>
        </VStack>
      </Center>
    );

  return (
    <Box
      as="main"
      bg={outerBg}
      mt={{ base: "130px", sm: "130px", md: "92px" }}
      minH="100vh"
    >
      {/* HERO */}
      <Box
        position="relative" // required for absolute children to be positioned to this box
        w="100%"
        h={heroHeight}
        overflow="visible"
        pt={{ base: "12px", md: 0 }}
        pb={{ base: 6, md: 0 }}
      >
        {/* BACKGROUND IMAGE (full cover) */}
        <Box
          position="absolute"
          inset="0"
          backgroundImage={`url(${firstEvent.featureImage})`}
          backgroundSize="cover"
          backgroundPosition="center"
          zIndex={0}
        />

        {/* GLOBAL DARK OVERLAY (alpha auto) */}
        <Box
          position="absolute"
          inset="0"
          bg={`rgba(0,0,0,${overlayAlpha})`} // overlayAlpha computed earlier
          zIndex={1}
          pointerEvents="none"
        />

        {/** DESKTOP GRADIENT OVERLAY (moved down below header) **/}
        {/** set HEADER_H to match your fixed navbar height (the value you used for mt on main, e.g. 92px) */}
        <Box
          display={{ base: "none", md: "block" }}
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          background="linear-gradient(
    90deg,
    rgba(0,0,0,0.48) 0%,
    rgba(0,0,0,0.32) 28%,
    rgba(0,0,0,0.15) 58%,
    rgba(0,0,0,0.00) 100%
  )"
          zIndex={2}
          pointerEvents="none"
        />

        {/* CONTENT container - make sure it has higher zIndex than overlays */}
        <Container
          maxW={{ base: "360px", sm: "420px", md: "90%", lg: "85%", xl: "80%" }}
          h="100%"
          position="relative"
          zIndex={5} // important: this must be greater than overlay zIndex (2)
          display="flex"
          alignItems="center"
          pt={{ base: 4, md: 0 }}
        >
          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={{ base: 6, md: 12 }}
            w="100%"
            maxW="1100px"
            mx="auto"
          >
            {/* LEFT SECTION */}
            <VStack
              align={{ base: "center", md: "flex-start" }}
              spacing={{ base: 6, md: 6 }}
              px={{ base: 3, md: 0 }}
              zIndex={7}
              width="100%"
            >
              {/* Heading + description with soft glass on mobile */}
              <Box
                w="100%"
                bg={{
                  base: "hsla(0,0%,0%,0.18)",
                  md: "transparent",
                }}
                p={{ base: 4, md: 0 }}
                borderRadius={{ base: "18px", md: "0" }}
                boxShadow={{ base: "0 4px 18px rgba(0,0,0,0.12)", md: "none" }}
                backdropFilter={{
                  base: "blur(4px) saturate(200%)",
                  md: "none",
                }}
                textAlign={{ base: "center", md: "left" }}
              >
                <Heading
                  fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                  fontWeight={900}
                  color="#fff"
                  maxW={{ base: "100%", md: "520px" }}
                  lineHeight={{ base: "1.05", md: "1.05" }}
                  mb={{ base: 2, md: 0 }}
                >
                  Guest Photos & Digital Guestbook
                </Heading>

                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  color="rgba(255,255,255,0.95)"
                  maxW={{ base: "100%", md: "520px" }}
                  mt={2}
                  lineHeight={{ base: 1.6, md: 1.5 }}
                  fontWeight={900}
                >
                  Share photos, leave messages, and keep memories from your
                  event — guests upload directly using the QR below.
                </Text>
              </Box>

              {/* QR CODE */}
              <Box
                display="flex"
                w={{ base: "165px", sm: "180px", md: "260px" }}
                h={{ base: "165px", sm: "180px", md: "260px" }}
                alignItems="center"
                justifyContent="center"
                borderRadius={{ base: "22px", md: "12px" }}
                bg={{
                  base: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))",
                  md: "white",
                }}
                border={{
                  base: "1px solid rgba(255,255,255,0.18)",
                  md: "none",
                }}
                boxShadow={{
                  base: "0 8px 22px rgba(0,0,0,0.12)",
                  md: "lg",
                }}
                backdropFilter={{
                  base: "blur(8px) saturate(150%)",
                  md: "none",
                }}
                p={{ base: 3, md: 0 }}
              >
                <Box
                  bg={{ base: "rgba(255,255,255,0.96)", md: "white" }}
                  p={{ base: 2, md: 6 }}
                  borderRadius={{ base: "12px", md: "10px" }}
                  boxShadow={{
                    base: "0 6px 18px rgba(0,0,0,0.10)",
                    md: "none",
                  }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <QRCode
                    id="qr-canvas"
                    value={`https://guestpov.ca/guest_login/${firstEvent.id}`}
                    size={qrSize}
                    fgColor="#000"
                    bgColor="#ffffff"
                  />
                </Box>
              </Box>

              {/* CTA BUTTONS */}
              <Stack
                direction={{ base: "column", md: "row" }}
                spacing={{ base: 3, md: 4 }}
                width="100%"
                align={{ base: "stretch", md: "center" }}
                mt={{ base: 3, md: 0 }}
              >
                {/* DOWNLOAD QR */}
                <Button
                  onClick={downloadQR}
                  w={{ base: "100%", md: "auto" }}
                  py={{ base: 4, md: 4 }}
                  borderRadius="lg"
                  bg={{
                    base: "rgba(0,0,0,0.30)",
                    md: "transparent",
                  }}
                  color="white"
                  borderWidth={{ base: "3px", md: "2px" }}
                  borderColor="white"
                  fontWeight={800}
                  fontSize={{ base: "17px", md: "16px" }}
                  rightIcon={<FaArrowRight />}
                  boxShadow={{
                    base: "0 6px 20px rgba(0,0,0,0.25)",
                    md: "none",
                  }}
                  backdropFilter={{
                    base: "blur(6px) saturate(180%)",
                    md: "none",
                  }}
                  _hover={{
                    bg: {
                      base: "rgba(255,255,255,0.18)",
                      md: "rgba(255,255,255,0.10)",
                    },
                  }}
                >
                  Download QR
                </Button>

                {/* OPEN CANVA */}
                <Button
                  onClick={() => history.push("/admin/canvatemplates")}
                  w={{ base: "100%", md: "auto" }}
                  py={{ base: 4, md: 4 }}
                  borderRadius="lg"
                  bg={{
                    base: "rgba(0,0,0,0.30)",
                    md: "transparent",
                  }}
                  color="white"
                  borderWidth={{ base: "3px", md: "2px" }}
                  borderColor="white"
                  fontWeight={800}
                  fontSize={{ base: "17px", md: "16px" }}
                  rightIcon={<FaArrowRight />}
                  boxShadow={{
                    base: "0 6px 20px rgba(0,0,0,0.25)",
                    md: "none",
                  }}
                  backdropFilter={{
                    base: "blur(6px) saturate(180%)",
                    md: "none",
                  }}
                  _hover={{
                    bg: {
                      base: "rgba(255,255,255,0.18)",
                      md: "rgba(255,255,255,0.10)",
                    },
                  }}
                >
                  Open Canva
                </Button>

                {/* TEST LINK */}
                <Button
                  onClick={() => setIsTestConfirmOpen(true)}
                  w={{ base: "100%", md: "auto" }}
                  py={{ base: 4, md: 4 }}
                  borderRadius="lg"
                  bg={{
                    base: "rgba(0,0,0,0.30)",
                    md: "transparent",
                  }}
                  color="white"
                  borderWidth={{ base: "3px", md: "2px" }}
                  borderColor="white"
                  fontWeight={800}
                  fontSize={{ base: "17px", md: "16px" }}
                  rightIcon={<FaArrowRight />}
                  boxShadow={{
                    base: "0 6px 20px rgba(0,0,0,0.25)",
                    md: "none",
                  }}
                  backdropFilter={{
                    base: "blur(6px) saturate(180%)",
                    md: "none",
                  }}
                  _hover={{
                    bg: {
                      base: "rgba(255,255,255,0.18)",
                      md: "rgba(255,255,255,0.10)",
                    },
                  }}
                >
                  Test Link
                </Button>
              </Stack>
            </VStack>

            {/* RIGHT CARD */}
            <Box
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              w="100%"
              maxW={{ base: "100%", md: "480px" }}
              p={{ base: 4, md: 6 }}
              display="flex"
              flexDirection="column"
              ml={{ base: 0, md: 6, lg: 12 }}
            >
              <Heading size="md" mb={2} fontWeight="800" color={textColor}>
                {firstEvent.eventPageHeader || firstEvent.eventName}
              </Heading>

              <Text color={muted} mb={4}>
                {firstEvent.welcomeMessage}
              </Text>

              <Text fontWeight="700">Date</Text>
              <Text color={muted} mb={4}>
                {firstEvent.dateOfEvent?.toDate
                  ? firstEvent.dateOfEvent.toDate().toDateString()
                  : firstEvent.dateOfEvent}
              </Text>

              <Text fontWeight="700">Site Closes</Text>
              <Text color={muted} mb={4}>
                {firstEvent.siteCloses?.toDate
                  ? firstEvent.siteCloses.toDate().toDateString()
                  : firstEvent.siteCloses}
              </Text>

              <Stack
                direction={{ base: "column", md: "row" }}
                spacing={3}
                mt={2}
                mb={4}
              >
                <Button
                  leftIcon={<FaImages />}
                  onClick={() => gotoGallery(UserInfo.role, firstEvent.id)}
                  w={{ base: "100%", md: "auto" }}
                  px={6}
                  py={4}
                  bgGradient={GRADIENT}
                  color="white"
                  fontWeight={800}
                  _hover={{
                    color: "white",
                    opacity: 0.92,
                  }}
                >
                  Photos
                </Button>

                <Button
                  leftIcon={<FaVideo />}
                  onClick={() => gotoVideos(UserInfo.role, firstEvent.id)}
                  w={{ base: "100%", md: "auto" }}
                  px={6}
                  py={4}
                  bgGradient={GRADIENT}
                  color="white"
                  fontWeight={800}
                  _hover={{
                    color: "white",
                    opacity: 0.92,
                  }}
                >
                  Videos
                </Button>

                <Button
                  leftIcon={<FaBook />}
                  onClick={() => gotoGuestbook(UserInfo.role, firstEvent.id)}
                  w={{ base: "100%", md: "auto" }}
                  px={6}
                  py={4}
                  bgGradient={GRADIENT}
                  color="white"
                  fontWeight={800}
                  _hover={{
                    color: "white",
                    opacity: 0.92,
                  }}
                >
                  Guestbook
                </Button>
              </Stack>

              <Box flex="1" />

              <HStack justifyContent="flex-end" spacing={3}>
                <Button
                  leftIcon={<FaEdit />}
                  bg={editBtnBg}
                  px={6}
                  py={3}
                  borderRadius="md"
                  fontWeight={700}
                  onClick={() => handleEdit(firstEvent.id)}
                >
                  Edit
                </Button>

                <Button
                  leftIcon={<FaTrash />}
                  variant="outline"
                  borderColor="red.400"
                  color="red.500"
                  px={6}
                  py={3}
                  borderRadius="md"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  Delete
                </Button>
              </HStack>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* DELETE CONFIRMATION */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteOpen(false)}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Delete event?</AlertDialogHeader>
          <AlertDialogBody>This action cannot be undone.</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={confirmDelete}
              isLoading={loadingDelete}
            >
              Yes, delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* TEST LINK CONFIRMATION (opens isolated window) */}
      <AlertDialog
        isOpen={isTestConfirmOpen}
        leastDestructiveRef={confirmRef}
        onClose={() => setIsTestConfirmOpen(false)}
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Open Guest Link ?
          </AlertDialogHeader>

          <AlertDialogBody>
            <strong>
              You will be redirected to the guest login page and after logging
              in as guest you will be logged out of your admin session.
            </strong>
            <br />
            <br />
            Do you want to continue?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={confirmRef}
              onClick={() => setIsTestConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              ml={3}
              onClick={() => {
                setIsTestConfirmOpen(false);

                window.location.href = `/guest_login/${firstEvent.id}`;
              }}
            >
              Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
