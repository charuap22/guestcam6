  // src/pages/DashboardSE.js
  import React, { useEffect, useState, useRef } from "react";
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
    Center,
    Spinner,
    Stack,
    useToast,
    useBreakpointValue,
    useColorModeValue,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
  } from "@chakra-ui/react";

  import {
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
  import { useUserInfo } from "../hooks/useUserInfo";
  import { useEvent } from "../hooks/useEvent";
  import { useFirestore } from "../hooks/useFirestore";

  export default function DashboardSE() {
    const history = useHistory();
    const toast = useToast();

    // -------------------------
    // 🔹 ALL HOOKS MUST COME FIRST
    // -------------------------
    const { user } = useAuthContext();
    const { UserInfo } = useUserInfo();

    // Required state/hooks
    const { deleteDocument } = useFirestore("events");
    const { changeEvent } = useEvent();

    const [firstEvent, setFirstEvent] = useState(null);
    const [overlayAlpha, setOverlayAlpha] = useState(0.3);

    const [loadingDelete, setLoadingDelete] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const deleteCancelRef = useRef();

    const [isTestConfirmOpen, setIsTestConfirmOpen] = useState(false);
    const testConfirmRef = useRef();

    const [isGuestRedirecting, setIsGuestRedirecting] = useState(false);

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
    const GRADIENT = "linear(to-r, #d4b483, #e5989b)";

    // -------------------------
    // 🔹 HOOK AFTER user IS READY
    // -------------------------
    const { documents: userEvents, isPending: eventsLoading } = useCollection(
      user ? "events" : null, // <--- THIS AVOIDS CONDITIONAL HOOK CALL
      user ? ["adminId", "==", user.uid] : null
    );

    // -------------------------
    // 🔹 EARLY GUEST REDIRECT
    // -------------------------
    useEffect(() => {
      if (!user || !UserInfo) return;

      const runRedirect = async () => {
        if (user.isAnonymous || UserInfo.role === "guest") {
          setIsGuestRedirecting(true);

          try {
            const db = firebase.firestore();
            const snap = await db.collection("guests").doc(user.uid).get();

            if (snap.exists && snap.data().eventId) {
              history.replace(`/admin/guest-dashboard/${snap.data().eventId}`);
            } else {
              history.replace(`/admin/guest-dashboard`);
            }
          } catch (e) {
            console.error(e);
          }
        }
      };

      runRedirect();
    }, [user, UserInfo, history]);

    // -------------------------
    // 🔹 Load first event
    // -------------------------
    useEffect(() => {
      if (Array.isArray(userEvents) && userEvents.length > 0) {
        setFirstEvent(userEvents[0]);
        changeEvent(userEvents[0].id);
      }
    }, [userEvents, changeEvent]);

    // -------------------------
    // 🔹 Background brightness → overlay
    // -------------------------
    useEffect(() => {
      if (!firstEvent?.featureImage) return;

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = firstEvent.featureImage;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 100;
        canvas.height = 100;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 100, 100);

        const data = ctx.getImageData(0, 0, 100, 100).data;
        let total = 0;

        for (let i = 0; i < data.length; i += 4) {
          total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        }

        const avg = total / (data.length / 4);
        const MIN = 0.18;
        const MAX = 0.55;
        const LUM_FLOOR = 60;

        const ratio = Math.max(
          0,
          Math.min(1, (avg - LUM_FLOOR) / (255 - LUM_FLOOR))
        );

        setOverlayAlpha(Number((MIN + (MAX - MIN) * ratio).toFixed(3)));
      };
    }, [firstEvent]);

    // -------------------------
    // 🔹 Combined Loading State
    // -------------------------
    const isLoadingInitial = !user || UserInfo === undefined;
    const isLoading = isGuestRedirecting || eventsLoading;

    if (isLoadingInitial) {
      return (
        <Center minH="100vh">
          <Spinner size="xl" />
        </Center>
      );
    }

    if (isLoading) {
      return (
        <Box
          as="main"
          bg={outerBg}
          mt={{ base: "130px", md: "92px" }}
          minH="100vh"
        >
          <Center minH="50vh">
            <Spinner size="xl" />
          </Center>
        </Box>
      );
    }

    // -------------------------
    // 🔹 No Events
    // -------------------------
    if (!firstEvent) {
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
    }

    // -------------------------
    // 🔹 Helpers
    // -------------------------
    const mapRole = (role) => {
      const r = String(role).toLowerCase();
      if (r === "owner") return "owner";
      return r || "guest";
    };

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

    const confirmDelete = async () => {
      setLoadingDelete(true);
      try {
        await deleteDocument(firstEvent.id);
        setFirstEvent(null);
        changeEvent(null);

        toast({
          title: "Event deleted",
          status: "success",
        });
      } catch (e) {
        toast({
          title: "Delete failed",
          description: e.message,
          status: "error",
        });
      } finally {
        setLoadingDelete(false);
        setIsDeleteOpen(false);
      }
    };

    // -------------------------
    // 🔹 UI
    // -------------------------
    return (
      <Box as="main" bg={outerBg} mt={{ base: "130px", md: "92px" }} minH="100vh">
        {/* HERO */}
        <Box position="relative" w="100%" h={heroHeight}>
          <Box
            position="absolute"
            inset="0"
            backgroundImage={`url(${firstEvent.featureImage})`}
            backgroundSize="cover"
            backgroundPosition="center"
          />

          <Box position="absolute" inset="0" bg={`rgba(0,0,0,${overlayAlpha})`} />

          <Container
            maxW={{ base: "360px", md: "90%", lg: "85%" }}
            h="100%"
            position="relative"
            zIndex={5}
            display="flex"
            alignItems="center"
          >
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              {/* LEFT */}
              <VStack align="flex-start" spacing={6}>
                <Heading color="white" fontWeight="900">
                  Guest Photos & Digital Guestbook
                </Heading>

                <Text color="white" maxW="520px">
                  Share photos, upload memories — guests scan the QR.
                </Text>

                <Box bg="white" p={4} borderRadius="lg" boxShadow="lg">
                  <QRCode
                    id="qr-canvas"
                    value={`https://guestpov.ca/guest_login/${firstEvent.id}`}
                    size={qrSize}
                  />
                </Box>

                <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                  <Button color="white" bg="rgba(0,0,0,0.3)" onClick={downloadQR}>
                    Download QR <FaArrowRight />
                  </Button>

                  <Button
                    color="white"
                    bg="rgba(0,0,0,0.3)"
                    onClick={() => history.push("/admin/canvatemplates")}
                  >
                    Open Canva <FaArrowRight />
                  </Button>

                  <Button
                    color="white"
                    bg="rgba(0,0,0,0.3)"
                    onClick={() => setIsTestConfirmOpen(true)}
                  >
                    Test Link <FaArrowRight />
                  </Button>
                </Stack>
              </VStack>

              {/* RIGHT CARD */}
              <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="lg">
                <Heading size="lg" mb={2}>
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
                  mb={4}
                >
                  <Button
                    leftIcon={<FaImages />}
                    bgGradient={GRADIENT}
                    color="white"
                    onClick={() =>
                      history.push(
                        `/admin/gallery/owner/${
                          firstEvent.id
                        }`
                      )
                    }
                  >
                    Photos
                  </Button>

                  <Button
                    leftIcon={<FaVideo />}
                    bgGradient={GRADIENT}
                    color="white"
                    onClick={() =>
                      history.push(
                        `/admin/videos/owner/${firstEvent.id}`
                      )
                    }
                  >
                    Videos
                  </Button>

                  <Button
                    leftIcon={<FaBook />}
                    bgGradient={GRADIENT}
                    color="white"
                    onClick={() =>
                      history.push(
                        `/admin/guestbook/owner/${
                          firstEvent.id
                        }`
                      )
                    }
                  >
                    Guestbook
                  </Button> 
                </Stack>

                <HStack justifyContent="flex-end">
                  <Button
                    leftIcon={<FaEdit />}
                    onClick={() =>
                      history.push(`/admin/edit-event/${firstEvent.id}`)
                    }
                  >
                    Edit
                  </Button>

                  <Button
                    leftIcon={<FaTrash />}
                    variant="outline"
                    borderColor="red.400"
                    color="red.500"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    Delete
                  </Button>
                </HStack>
              </Box>
            </SimpleGrid>
          </Container>
        </Box>

        {/* DELETE DIALOG */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={deleteCancelRef}
          onClose={() => setIsDeleteOpen(false)}
        >
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader>Delete event?</AlertDialogHeader>
            <AlertDialogBody>This action cannot be undone.</AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={deleteCancelRef}
                onClick={() => setIsDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                isLoading={loadingDelete}
                onClick={confirmDelete}
              >
                Yes, delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* TEST LINK */}
        <AlertDialog
          isOpen={isTestConfirmOpen}
          leastDestructiveRef={testConfirmRef}
          onClose={() => setIsTestConfirmOpen(false)}
        >
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader>Open Guest Link?</AlertDialogHeader>
            <AlertDialogBody>
              You will go to guest login and be logged out as admin.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={() => setIsTestConfirmOpen(false)}>Cancel</Button>
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
