// src/pages/Gallery.js
import React, { useEffect, useState, useRef } from "react";
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
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  HStack,
  Grid,
  GridItem,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tag,
  Tooltip,
  Center,
  Fade,
} from "@chakra-ui/react";

import { AddIcon } from "@chakra-ui/icons";
import {
  FiMoreHorizontal,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiDownload,
  FiTrash2,
} from "react-icons/fi";

import UploadForm from "../components/UploadForm";
import ImageCardSkeleton from "../components/ImageCardSkeleton";

const Viewer = ({ isOpen, onClose, images, startIndex, onDelete }) => {
  const [index, setIndex] = useState(startIndex || 0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setIndex(startIndex || 0);
  }, [startIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, index, images]);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  const handleTouchStart = (e) => setTouchStartX(e.touches?.[0]?.clientX);
  const handleTouchMove = (e) => setTouchEndX(e.touches?.[0]?.clientX);
  const handleTouchEnd = () => {
    if (touchStartX == null || touchEndX == null) return;
    const dx = touchEndX - touchStartX;
    if (dx > 50) prev();
    else if (dx < -50) next();
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleDownload = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "photo";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDeleteClick = async () => {
    const img = images[index];
    await onDelete(img);
    if (index >= images.length - 1) {
      setIndex(Math.max(0, images.length - 2));
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      isCentered
      motionPreset="none"
    >
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent
        maxW="100vw"
        w="100vw"
        h="100vh"
        bg="transparent"
        boxShadow="none"
        overflow="hidden"
      >
        <ModalBody p={0} h="100vh" display="flex" flexDirection="column">
          <Flex
            position="absolute"
            top={3}
            left={3}
            right={3}
            justify="space-between"
            zIndex={40}
          >
            <HStack spacing={2}>
              <IconButton
                aria-label="close"
                icon={<FiX />}
                onClick={onClose}
                bg="rgba(0,0,0,0.45)"
                color="white"
                size="sm"
              />
              <Tag bg="rgba(0,0,0,0.45)" color="white" fontSize="sm">
                {index + 1} / {images.length}
              </Tag>
            </HStack>

            <HStack spacing={2}>
              <Tooltip label="Download">
                <IconButton
                  aria-label="download"
                  icon={<FiDownload />}
                  onClick={() => handleDownload(images[index].url)}
                  bg="rgba(0,0,0,0.45)"
                  color="white"
                  size="sm"
                />
              </Tooltip>
              <Tooltip label="Delete">
                <IconButton
                  aria-label="delete"
                  icon={<FiTrash2 />}
                  onClick={handleDeleteClick}
                  bg="rgba(0,0,0,0.45)"
                  color="white"
                  size="sm"
                />
              </Tooltip>
            </HStack>
          </Flex>

          <Center
            flex="1"
            position="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            ref={containerRef}
          >
            <Fade in={isOpen} key={images[index].url}>
              <Box
                maxW="100vw"
                maxH="100vh"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <IconButton
                  aria-label="prev"
                  icon={<FiChevronLeft />}
                  position="absolute"
                  left={2}
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={30}
                  onClick={prev}
                  bg="rgba(0,0,0,0.35)"
                  color="white"
                  size="sm"
                />
                <Image
                  src={images[index].url}
                  maxH="86vh"
                  maxW="92vw"
                  objectFit="contain"
                  borderRadius="md"
                />
                <IconButton
                  aria-label="next"
                  icon={<FiChevronRight />}
                  position="absolute"
                  right={2}
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={30}
                  onClick={next}
                  bg="rgba(0,0,0,0.35)"
                  color="white"
                  size="sm"
                />
              </Box>
            </Fade>
          </Center>

          <Box
            px={{ base: 3, md: 8 }}
            py={3}
            bg="linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)"
            color="white"
          >
            <Flex align="center" justify="space-between">
              <Box>
                <Text fontSize={{ base: "sm", md: "md" }} fontWeight="600">
                  {images[index]?.filename || "Photo"}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.700">
                  {images[index]?.createdAt
                    ? new Date(
                        images[index].createdAt.toDate
                          ? images[index].createdAt.toDate()
                          : images[index].createdAt
                      ).toLocaleString()
                    : ""}
                </Text>
              </Box>

              <HStack spacing={2}>
                <Button
                  variant="ghost"
                  color="white"
                  onClick={() => handleDownload(images[index].url)}
                  size="sm"
                >
                  Download
                </Button>
                <Button
                  colorScheme="red"
                  variant="outline"
                  onClick={handleDeleteClick}
                  size="sm"
                >
                  Delete
                </Button>
                <Button onClick={onClose} size="sm">
                  Close
                </Button>
              </HStack>
            </Flex>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const Gallery = () => {
  // theme & hooks
  const bg = useColorModeValue("gray.50", "gray.900");
  const gold = "#d4af37";

  // color-mode values
  const tileBg = useColorModeValue("white", "gray.800");
  const tileShadow = useColorModeValue(
    "0 8px 30px rgba(15, 23, 42, 0.06)",
    "0 6px 20px rgba(0,0,0,0.3)"
  );
  const addCardBg = useColorModeValue("white", "gray.800");

  const { id, userType } = useParams();
  const { user } = useAuthContext();
  const { changeEvent } = useEvent();

  const {
    documents: images,
    error,
    isPending,
  } = useCollection("gallery", ["eventId", "==", id], ["createdAt", "desc"]);
  const { document: eventDoc, error: eventError } = useDocument("events", id);
  const { deleteDocument } = useFirestore("gallery");

  useEffect(() => {
    if (id) changeEvent(id);
  }, [id, changeEvent]);

  const safeImages = images || [];

  // use default names for useDisclosure so Chakra's focus manager is stable
  const {
    isOpen: uploadOpen,
    onOpen: openUpload,
    onClose: closeUpload,
  } = useDisclosure();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const openViewerAt = (idx) => {
    setViewerIndex(idx);
    setViewerOpen(true);
    // ensure upload modal is closed if open
    if (uploadOpen) closeUpload();
  };

  const handleDelete = async (img) => {
    if (!window.confirm("Delete this photo? This action cannot be undone."))
      return;
    try {
      await deleteDocument(img.id);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed: " + (err.message || err));
    }
  };

  const handleDownload = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "photo";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

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
        <Text ml={3}>Loading photos...</Text>
      </Flex>
    );
  }

 
  return (
    <Box
      minH="100vh"
      bg={bg}
      py={{ base: 10, md: 10 }}
      mt={{ base: 20, md: 10 }} // ✅ No top margin on mobile, only on desktop
    >
      {/* Upload Modal moved to top so it layers above viewer properly */}
      <Modal
        isOpen={uploadOpen}
        onClose={closeUpload}
        size="lg"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent borderRadius="2xl" p={4}>
          <ModalCloseButton />
          <ModalBody>
            <UploadForm
              user={user}
              // onUploadComplete={() => {
              //   closeUpload();
              // }}
              onClose={closeUpload}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Gallery container - full width on mobile */}
      <Box
        px={{ base: 3, md: 8 }}
        py={{ base: 4, md: 10 }}
        mx="auto"
        w="100%"
        maxW="100%"
      >
        {isPending ? (
          <Flex wrap="wrap" justify="center" gap={{ base: 3, md: 6 }}>
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <ImageCardSkeleton key={k} />
            ))}
          </Flex>
        ) : (
          <Grid
            templateColumns={{
              base: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
            }}
            gap={{ base: 3, md: 4 }}
          >
            {/* Add card - same responsive tile sizing */}
            <GridItem>
              <Box
                role="button"
                onClick={openUpload}
                cursor="pointer"
                borderRadius={{ base: "16px", md: "24px" }}
                bg={addCardBg}
                boxShadow={tileShadow}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                h={{ base: "160px", md: "220px" }}
                transition="all .18s ease"
                _hover={{ transform: "translateY(-6px)" }}
              >
                <Box
                  w={{ base: "52px", md: "64px" }}
                  h={{ base: "52px", md: "64px" }}
                  borderRadius="12px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bgGradient="linear(to-b,#6b46ff,#805ad5)"
                  boxShadow="0 8px 24px rgba(99,102,241,0.14)"
                >
                  <AddIcon boxSize={{ base: 5, md: 7 }} color="white" />
                </Box>
                <VStack spacing={1} mt={3}>
                  <Text fontWeight="700" fontSize={{ base: "sm", md: "md" }}>
                    Add Photos
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {safeImages.length} photo
                    {safeImages.length === 1 ? "" : "s"}
                  </Text>
                </VStack>
              </Box>
            </GridItem>

            {/* Image tiles */}
            {safeImages.length > 0 ? (
              safeImages.map((img, idx) => (
                <GridItem key={img.id}>
                  <Box
                    borderRadius={{ base: "16px", md: "24px" }}
                    overflow="hidden"
                    bg={tileBg}
                    boxShadow={tileShadow}
                    h={{ base: "160px", md: "220px" }}
                    position="relative"
                    transition="transform .18s ease"
                    _hover={{ transform: "translateY(-6px)" }}
                  >
                    <Box
                      onClick={() => openViewerAt(idx)}
                      cursor="pointer"
                      h="100%"
                    >
                      <Image
                        src={img.url}
                        alt={img.filename || "photo"}
                        objectFit="cover"
                        w="100%"
                        h="100%"
                      />
                    </Box>

                    {/* top-right menu */}
                    <Box position="absolute" top={2} right={2} zIndex={3}>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Options"
                          icon={<FiMoreHorizontal />}
                          size="sm"
                          variant="ghost"
                          bg="rgba(255,255,255,0.06)"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<FiDownload />}
                            onClick={() => handleDownload(img.url)}
                          >
                            Download
                          </MenuItem>
                          <MenuItem
                            icon={<FiTrash2 />}
                            onClick={() => handleDelete(img)}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Box>

                    {/* bottom-left badge: author + timeAgo */}
                    <Box
                      position="absolute"
                      bottom={3}
                      left={3}
                      zIndex={2}
                      bg="rgba(0,0,0,0.45)"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      <Text fontSize="xs" color="gray.200">
                        {img.createdByName || "Guest"}{" "}
                        {img.createdAt
                          ? `• ${(() => {
                              const seconds = Math.floor(
                                (Date.now() -
                                  (img.createdAt?.toDate
                                    ? img.createdAt.toDate().getTime()
                                    : new Date(img.createdAt).getTime())) /
                                  1000
                              );
                              if (seconds < 60) return "just now";
                              if (seconds < 3600)
                                return `${Math.floor(seconds / 60)}m ago`;
                              if (seconds < 86400)
                                return `${Math.floor(seconds / 3600)}h ago`;
                              return `${Math.floor(seconds / 86400)}d ago`;
                            })()}`
                          : ""}
                      </Text>
                    </Box>
                  </Box>
                </GridItem>
              ))
            ) : (
              <GridItem colSpan={{ base: 2, md: 4 }}>
                <Flex direction="column" align="center" py={14}>
                  <Text color="gray.500">
                    No photos yet — be the first to upload a memory ✨
                  </Text>
                </Flex>
              </GridItem>
            )}
          </Grid>
        )}
      </Box>

      {/* Viewer modal */}
      <Viewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={safeImages}
        startIndex={viewerIndex}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default Gallery;
