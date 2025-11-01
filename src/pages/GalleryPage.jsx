/ src/pages/Gallery.js
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


export default function GalleryPage() {
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
    <Box minH="80vh" bg={bg} p={{ base: 4, md: 8 }}>
      <Flex mb={6} align="center" justify="space-between">
        <HStack>
          <Heading size="lg">Gallery</Heading>
          <Text color="gray.500">{eventDoc?.title}</Text>
        </HStack>

        <HStack>
          <Input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            display="none"
            onChange={(e) => handleFilesUpload(e.target.files)}
            id="gallery-file-input"
          />

          <label htmlFor="gallery-file-input">
            <Button leftIcon={<AddIcon />} as="span" colorScheme="yellow">
              Add Photos
            </Button>
          </label>
        </HStack>
      </Flex>

      {/* header image preview */}
      {headerImage && (
        <Box mb={6} rounded="md" overflow="hidden">
          <Image
            src={headerImage}
            alt="event header"
            w="100%"
            h={{ base: "160px", md: "260px" }}
            objectFit="cover"
          />
        </Box>
      )}

      {/* upload progress */}
      {uploading && (
        <VStack spacing={2} mb={6} align="stretch">
          {Object.keys(progressMap).map((name) => (
            <Box key={name}>
              <Text fontSize="sm">{name}</Text>
              <Progress value={progressMap[name] || 0} size="sm" />
            </Box>
          ))}
        </VStack>
      )}

      {/* images grid */}
      <Box>
        {isPending && (
          <Flex align="center" justify="center" py={12}>
            <Spinner size="lg" color={gold} />
            <Text ml={3}>Loading images...</Text>
          </Flex>
        )}

        {!isPending && safeImages.length === 0 && (
          <Flex py={12} align="center" justify="center" direction="column">
            <Text>No photos yet. Add some using the button above.</Text>
          </Flex>
        )}

        <Grid
          templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
          gap={4}
        >
          {safeImages.map((img) => (
            <GridItem
              key={img.id}
              borderRadius="md"
              overflow="hidden"
              bg="white"
            >
              <Box position="relative">
                <Image
                  src={img.url}
                  alt="gallery"
                  objectFit="cover"
                  w="100%"
                  h="160px"
                />
                <Flex position="absolute" top={2} right={2}>
                  <IconButton
                    aria-label="delete"
                    icon={<DeleteIcon />}
                    size="sm"
                    onClick={() => handleDelete(img)}
                    bg="rgba(0,0,0,0.6)"
                    color="white"
                    _hover={{ bg: "rgba(0,0,0,0.8)" }}
                  />
                </Flex>
              </Box>
            </GridItem>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
