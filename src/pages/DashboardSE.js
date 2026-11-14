  // src/pages/DashboardSE.js
  import React, { useEffect, useState, useRef } from "react";
  import { useHistory } from "react-router-dom";
  import QRCode from "qrcode.react";

  import {
    Grid,Flex,
    Divider,
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

    const primaryBg = "#EBD9A6";
    const primaryHover = "#D1B7A1";
    const primaryText = "#3A2F2A";
    const softBorder = "#a57256";

    // -------------------------
    // 🔹 ALL HOOKS MUST COME FIRST
    // -------------------------
    const { user } = useAuthContext();
    const { UserInfo } = useUserInfo();

    useEffect(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, []);

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
          minH="100vh"
          bg="#F7F8FA"
          w="100vw" // 🔒 lock width
          maxW="100vw" // 🔒 prevent expansion
          overflowX="hidden" // 🔒 kill horizontal pan
          px={{ base: 4, md: 6, xl: 10 }}
          py={{ base: 6, md: 8 }}
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
    <Box w="100%" maxW="100vw" overflowX="hidden">
      <Center minH="calc(100vh - 120px)" w="100%" px={4}>
        <VStack
          spacing={6}
          textAlign="center"
          w="100%"
          maxW="360px" // ✅ keeps it visually centered
        >
          <Heading size="lg">No events yet</Heading>

          <Text color="gray.500" fontSize="sm">
            Create your first event and start collecting memories.
          </Text>

          <Button
            size="lg"
            borderRadius="full"
            w="100%"
            onClick={() => history.push("/admin/create-event")}
          >
            Create Event
          </Button>
        </VStack>
      </Center>
    </Box>
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
 
    const featureImage = firstEvent?.featureImage;

    console.log("featureImage =", featureImage);
    console.log("event =", firstEvent);
console.log(
  "backgroundImage string =",
  featureImage ? `url("${featureImage}")` : "none",
);

    // -------------------------
    // 🔹 UI
    // -------------------------
return (
  <Box
    as="main"
    minH="100vh"
    bg="#F7F8FA"
    px={{ base: 0, md: 6, xl: 10 }}
    py={{ base: 6, md: 8 }}
    overflowX="hidden" // ✅ FIX
  >
    <Grid
      templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
      gap={{ base: 6, lg: 8 }}
      alignItems="stretch"
      overflowX="hidden"
    >
      {/* IMAGE + QR (JOINED) */}
      <Grid
        templateColumns={{ base: "1fr", md: "1.2fr 1fr" }}
        mt={{ base: 20, md: 0 }} // ✅ adds space ONLY on mobile
        bg="white"
        rounded="2xl"
        overflow="hidden"
        shadow="sm"
      >
        {/* IMAGE */}
        {/* <Box
          bgImage={`url(${firstEvent.featureImage})`}
          bgSize="cover"
          bgPosition="center"
          minH={{ base: "200px", md: "420px" }}
        /> */}
        <Box
          backgroundImage={`url("${firstEvent.featureImage}")`}
          backgroundSize="cover"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          minH={{ base: "200px", md: "420px" }}
        />

        {/* QR SECTION */}
        <Box
          bg="#FFF9E8"
          px={{ base: 5, md: 8 }}
          py={{ base: 6, md: 8 }}
          display="flex"
          alignItems={{ base: "flex-start", md: "center" }} // ✅ FIX
        >
          <Stack
            spacing={4}
            w="100%"
            align="center"
            pb={{ base: 4, md: 0 }} // extra breathing room
          >
            <Heading size="md" textAlign="center" wordBreak="break-word">
              Scan to add your memories
            </Heading>

            <Text fontSize="sm" color="gray.700" textAlign="center">
              Your guests can easily add their photos and videos to your digital
              guestbook by scanning this QR code or opening the guest link —
              before, during, or even after the event.
            </Text>

            <Text fontSize="sm" fontWeight="500">
              Scan. Tap. Upload.
            </Text>

            <Box
              bg="white"
              p={4}
              rounded="xl"
              border="1px solid"
              borderColor="gray.200"
            >
              <QRCode
                id="qr-canvas"
                value={`https://guestpov.ca/guest_login/${firstEvent.id}`}
                size={qrSize} // ✅ responsive
                mt={2}
              />
            </Box>

            {/* BUTTONS — CONSISTENT */}
            {/* PRIMARY QR ACTIONS */}
            <HStack w="100%" spacing={3}>
              <Button
                flex="1"
                bg="gray.900"
                color="white"
                _hover={{ bg: "gray.800" }}
                onClick={downloadQR}
              >
                Download QR
              </Button>

              <Button
                flex="1"
                variant="outline"
                borderColor="gray.300"
                color="gray.700"
                _hover={{ bg: "gray.50", borderColor: "gray.400" }}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://guestpov.ca/guest_login/${firstEvent.id}`,
                  );

                  toast({
                    title: "Link copied",
                    description: "Guest upload link copied to clipboard.",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                    position: "bottom",
                  });
                }}
              >
                Copy Guest Link
              </Button>
            </HStack>

            <Button
              w="100%"
              variant="outline"
              onClick={() => history.push("/admin/canvatemplates")}
              borderColor="gray.400"
            >
              Open canva for printed cards and signs.
            </Button>

            <Button
              w="100%"
              variant="outline"
              onClick={() => setIsTestConfirmOpen(true)}
              borderColor="gray.400"
            >
              Test Guest Link
            </Button>

            {/* TRUST POINTS */}
            <Stack
              spacing={1}
              pt={2}
              fontSize="xs"
              color="gray.600"
              textAlign="center"
            >
              <Text>• Share as a link through email, SMS, or chat apps</Text>
              <Text>• Share as a QR code on printed cards and signs</Text>
              <Text fontWeight="500">
                • No app downloads. No registrations needed.
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Grid>

      {/* EVENT DETAILS — EDITORIAL STYLE */}
      <Box
        bg="white"
        rounded="2xl"
        shadow="sm"
        px={{ base: 6, md: 7 }}
        py={{ base: 6, md: 7 }}
      >
        <Stack spacing={5}>
          {/* EYEBROW */}

          <Text
            fontSize="xs"
            fontWeight="600"
            letterSpacing="wide"
            color="gray.500"
            mb={2}
          >
            EVENT DETAILS
          </Text>
          <Heading size="md" mb={1}>
            {firstEvent.eventPageHeader || firstEvent.eventName}
          </Heading>

          <Text fontSize="sm" color="gray.600">
            {firstEvent.welcomeMessage}
          </Text>

          {/* META — CLEAN & PROFESSIONAL */}
          <Stack spacing={4} fontSize="sm">
            <Flex justify="space-between">
              <Text color="gray.500">Date</Text>
              <Text fontWeight="500">
                {firstEvent.dateOfEvent?.toDate
                  ? firstEvent.dateOfEvent.toDate().toDateString()
                  : firstEvent.dateOfEvent}
              </Text>
            </Flex>

            <Flex justify="space-between">
              <Text color="gray.500">Site closes</Text>
              <Text fontWeight="500">
                {firstEvent.siteCloses?.toDate
                  ? firstEvent.siteCloses.toDate().toDateString()
                  : firstEvent.siteCloses}
              </Text>
            </Flex>

            <Flex justify="space-between">
              <Text color="gray.500">Status</Text>
              <HStack>
                <Box w="8px" h="8px" bg="green.400" rounded="full" />
                <Text fontWeight="500" color="green.600">
                  Live
                </Text>
              </HStack>
            </Flex>
          </Stack>

          {/* NAV ACTIONS */}
          <HStack spacing={2} pt={2} flexWrap="wrap">
            <Button
              bg={primaryBg}
              color={primaryText}
              _hover={{ bg: primaryHover }}
              borderRadius="full"
              px={4}
              py={4}
              onClick={() =>
                history.push(`/admin/gallery/owner/${firstEvent.id}`)
              }
            >
              Photos
            </Button>

            <Button
              borderRadius="full"
              px={4}
              py={4}
              variant="outline"
              onClick={() =>
                history.push(`/admin/videos/owner/${firstEvent.id}`)
              }
              borderColor="gray.400"
            >
              Videos
            </Button>

            <Button
              borderRadius="full"
              px={4}
              py={4}
              bg="gray.900"
              color="white"
              _hover={{ bg: "gray.600" }}
              onClick={() =>
                history.push(`/admin/guestbook/owner/${firstEvent.id}`)
              }
            >
              Guestbook
            </Button>
          </HStack>
        </Stack>

        <HStack justifyContent="flex-end" mt={6}>
          <Button
            leftIcon={<FaEdit />}
            onClick={() => history.push(`/admin/edit-event/${firstEvent.id}`)}
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

        {/* PLAN DETAILS */}
        <Divider my={4} />

        <Stack spacing={4} pt={2}>
          {/* Eyebrow */}
          <Text
            fontSize="xs"
            fontWeight="600"
            letterSpacing="wide"
            color="gray.500"
          >
            PLAN DETAILS
          </Text>

          {/* Plan Name */}
          <Heading size="sm" lineHeight="1.3">
            {UserInfo?.planName || "Free"} Plan
          </Heading>

          {/* Sub text */}
          <Text fontSize="sm" color="gray.600">
            Unlock more features and storage for your events.
          </Text>

          {/* CTA */}
          <Button
            size="sm"
            borderRadius="full"
            px={6}
            fontWeight="600"
            onClick={() => history.push("/pricing", { allowUpgrade: true })}
          >
            Change Plan
          </Button>
        </Stack>
      </Box>
    </Grid>
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
          <Button ref={deleteCancelRef} onClick={() => setIsDeleteOpen(false)}>
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
            colorScheme="yellow"
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
