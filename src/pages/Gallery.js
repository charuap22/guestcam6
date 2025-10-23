// src/pages/Gallery.js
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useCollection } from "../hooks/useCollection";
import { useEvent } from "../hooks/useEvent";
import { useDocument } from "../hooks/useDocument";
import { useFirestore } from "../hooks/useFirestore";

import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Spinner,
  Button,
  Icon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Stack,
} from "@chakra-ui/react";
import { FaCameraRetro } from "react-icons/fa";

import UploadForm from "../components/UploadForm";
import ImageGrid from "../components/ImageGrid";
import ImageCardSkeleton from "../components/ImageCardSkeleton";

const Gallery = () => {
  // theme & hooks
  const bg = useColorModeValue("gray.50", "gray.900");
  const gold = "#d4af37";

  const { id, userType } = useParams();
  const { user } = useAuthContext();
  const { changeEvent } = useEvent();

  // collection of gallery images
  const {
    documents: images,
    error,
    isPending,
  } = useCollection("gallery", ["eventId", "==", id], ["createdAt", "desc"]);

  // event doc for header/background
  const { document: eventDoc, error: eventError } = useDocument("events", id);

  // firestore helper for deletes
  const { deleteDocument } = useFirestore("gallery");

  useEffect(() => {
    if (id) changeEvent(id);
  }, [id, changeEvent]);

  const safeImages = images || [];
  const { isOpen, onOpen, onClose } = useDisclosure();

  // errors / loading
  if (error || eventError) {
    return (
      <Flex minH="80vh" align="center" justify="center" direction="column">
        <Text color="red.500" fontWeight="bold">
          {error || eventError}
        </Text>
      </Flex>
    );
  }

  if (!eventDoc) {
    return (
      <Flex minH="80vh" align="center" justify="center">
        <Spinner size="xl" color={gold} />
        <Text ml={3}>Loading event...</Text>
      </Flex>
    );
  }

  const headerImage = eventDoc?.featureImage || "";

  return (
    <Box minH="100vh" bg={bg}>
      {/* HERO (edge-to-edge on mobile) */}
      <Box
        position="relative"
        w="100%"
        h={{ base: "340px", md: "420px" }}
        bgImage={`url(${headerImage})`}
        bgSize="cover"
        bgPos="center"
        overflow="hidden"
        borderBottom="4px solid rgba(212,175,55,0.25)"
        borderRadius={{ base: 0, md: "0" }}
      >
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.28) 60%)"
          backdropFilter="blur(2px)"
        />

        <VStack
          position="relative"
          zIndex="2"
          spacing={7}
          textAlign="center"
          justify="center"
          h="100%"
          px={6}
        >
          {/* Elegant glass panel behind text */}
          <Box
            position="absolute"
            insetX={{ base: "5%", md: "15%" }}
            top="25%"
            px={{ base: 5, md: 12 }}
            py={{ base: 6, md: 10 }}
            bg="rgba(0,0,0,0.35)"
            backdropFilter="blur(10px)"
            borderRadius="2xl"
            border="1px solid rgba(255,255,255,0.25)"
            boxShadow="0 12px 40px rgba(0,0,0,0.45)"
            zIndex="1"
          />

          {/* Event Title */}
          <Heading
            fontSize={{ base: "3xl", sm: "5xl", md: "6xl", lg: "7xl" }}
            fontWeight="extrabold"
            color="#FFD700"
            letterSpacing="wide"
            lineHeight="1.1"
            textShadow="0 6px 20px rgba(0,0,0,0.8)"
            zIndex="2"
          >
            {eventDoc?.eventName ?? "Mia & Daniel"}
          </Heading>

          {/* Subtitle */}
          <Text
            fontSize={{ base: "lg", md: "2xl" }}
            color="whiteAlpha.900"
            maxW="4xl"
            fontWeight="semibold"
            textShadow="0 4px 14px rgba(0,0,0,0.6)"
            zIndex="2"
          >
            Together on the path of love — cherish every moment 💛
          </Text>

          {/* Buttons */}
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={6}
            align="center"
            justify="center"
            zIndex="2"
            mt={4}
          >
            <Button
              size="lg"
              bgGradient="linear(to-r, #1f1f1f, #b58e0a)"
              color="white"
              leftIcon={<Icon as={FaCameraRetro} color="#FFD700" />}
              borderRadius="full"
              px={10}
              py={7}
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="bold"
              boxShadow="0 15px 45px rgba(0,0,0,0.45)"
              _hover={{
                transform: "translateY(-3px)",
                boxShadow: "0 25px 50px rgba(255,215,0,0.4)",
                bgGradient: "linear(to-r, #111, #FFD700)",
              }}
              onClick={onOpen}
              zIndex="2"
            >
              Upload Photos / Videos
            </Button>

            <Box
              px={4}
              py={3}
              borderRadius="full"
              bg="whiteAlpha.300"
              color="white"
              fontWeight="bold"
              fontSize={{ base: "md", md: "lg" }}
              boxShadow="0 8px 22px rgba(0,0,0,0.25)"
              zIndex="2"
            >
              {safeImages.length} photos collected
            </Box>
          </Stack>
        </VStack>
      </Box>

      {/* GALLERY container - full width on mobile */}
      <Box
        px={{ base: 1, md: 8 }}
        py={{ base: 4, md: 8 }}
        mx="auto"
        w="100%"
        maxW={{ base: "100%", md: "7xl" }}
      >
        {isPending && (
          <Flex wrap="wrap" justify="center" gap={6}>
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <ImageCardSkeleton key={k} />
            ))}
          </Flex>
        )}

        {safeImages.length > 0 ? (
          <ImageGrid
            images={safeImages}
            eventId={id}
            userId={user?.uid}
            userType={userType}
            deleteDocumentsFn={deleteDocument} // <-- PASS delete function
          />
        ) : (
          !isPending && (
            <Flex direction="column" align="center" py={14}>
              <Text color="gray.500">
                No photos yet — be the first to upload a memory ✨
              </Text>
            </Flex>
          )
        )}
      </Box>

      {/* Upload Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent borderRadius="2xl" p={4}>
          <ModalHeader textAlign="center" mt={2}>
            Upload Photos & Videos
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <UploadForm user={user} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Gallery;
