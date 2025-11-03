// src/pages/Videos.js
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
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  HStack,
  Grid,
  GridItem,
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
import { FiMoreHorizontal, FiX, FiDownload, FiTrash2 } from "react-icons/fi";

import VideoUploadForm from "../components/VideoUploadForm";// swap with VideoUploadForm if you have one
import ImageCardSkeleton from "../components/ImageCardSkeleton";

const Viewer = ({ isOpen, onClose, videos, startIndex, onDelete }) => {
  const [index, setIndex] = useState(startIndex || 0);
  const videoRef = useRef(null);

  useEffect(() => setIndex(startIndex || 0), [startIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    // autoplay the current video when viewer opens/changes
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, [isOpen, index]);

  const handleDownload = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "video";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDeleteClick = async () => {
    const vid = videos[index];
    await onDelete(vid);
    if (index >= videos.length - 1) {
      setIndex(Math.max(0, videos.length - 2));
    }
  };

  if (!videos || videos.length === 0) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
      <ModalOverlay bg="blackAlpha.900" />
      <ModalContent
        maxW="100vw"
        w="100vw"
        h="100vh"
        bg="transparent"
        boxShadow="none"
        overflow="hidden"
      >
        <ModalBody p={0} h="100vh" display="flex" flexDirection="column">
          {/* top bar */}
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
                {index + 1} / {videos.length}
              </Tag>
            </HStack>

            <HStack spacing={2}>
              <Tooltip label="Download">
                <IconButton
                  aria-label="download"
                  icon={<FiDownload />}
                  onClick={() => handleDownload(videos[index].url)}
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

          {/* video area */}
          <Center flex="1" position="relative" bg="black">
            <Fade in={isOpen} key={videos[index].url}>
              <Box
                maxW="100vw"
                maxH="100vh"
                display="flex"
                alignItems="center"
                justifyContent="center"
                w="100%"
              >
                <video
                  ref={videoRef}
                  src={videos[index].url}
                  controls
                  playsInline
                  style={{
                    maxHeight: "86vh",
                    maxWidth: "92vw",
                    objectFit: "contain",
                  }}
                />
              </Box>
            </Fade>
          </Center>

          {/* caption / controls */}
          <Box
            px={{ base: 3, md: 8 }}
            py={3}
            bg="linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)"
            color="white"
          >
            <Flex align="center" justify="space-between">
              <Box>
                <Text fontSize={{ base: "sm", md: "md" }} fontWeight="600">
                  {videos[index]?.filename || "Video"}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.700">
                  {videos[index]?.createdAt
                    ? new Date(
                        videos[index].createdAt?.toDate
                          ? videos[index].createdAt.toDate()
                          : videos[index].createdAt
                      ).toLocaleString()
                    : ""}
                </Text>
              </Box>

              <HStack spacing={2}>
                <Button
                  variant="ghost"
                  color="white"
                  onClick={() => handleDownload(videos[index].url)}
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

const Videos = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const gold = "#d4af37";

  const tileBg = useColorModeValue("white", "gray.800");
  const tileShadow = useColorModeValue(
    "0 8px 30px rgba(15, 23, 42, 0.06)",
    "0 6px 20px rgba(0,0,0,0.3)"
  );
  const addCardBg = useColorModeValue("white", "gray.800");

  const { id, userType } = useParams();
  const { user } = useAuthContext();
  const { changeEvent } = useEvent();

  // NOTE: use 'videos' collection here
  const {
    documents: videos,
    error,
    isPending,
  } = useCollection("videos", ["eventId", "==", id], ["createdAt", "desc"]);
  const { document: eventDoc, error: eventError } = useDocument("events", id);
  const { deleteDocument } = useFirestore("videos");

  useEffect(() => {
    if (id) changeEvent(id);
  }, [id, changeEvent]);

  const safeVideos = videos || [];

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
    if (uploadOpen) closeUpload();
  };

  const handleDelete = async (vid) => {
    if (!window.confirm("Delete this video? This action cannot be undone."))
      return;
    try {
      await deleteDocument(vid.id);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed: " + (err.message || err));
    }
  };

  const handleDownload = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "video";
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
        <Text ml={3}>Loading videos...</Text>
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
      {/* Upload Modal — swap UploadForm for a video-capable uploader if you have one */}
      <Modal isOpen={uploadOpen} onClose={closeUpload} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent borderRadius="2xl" p={4}>
          <ModalCloseButton />
          <ModalBody>
            {/* Use a video-upload form that uploads to 'videos' collection */}
            <VideoUploadForm
              user={user}
              eventId={id}
              // onUploadComplete={
              //   () => closeUpload()
              //   } // optional: close after each upload or handle differently
              onClose={closeUpload}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Grid */}
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
            gap={{ base: 4, md: 6 }}
          >
            {/* Add card */}
            <GridItem>
              <Box
                role="button"
                onClick={openUpload}
                cursor="pointer"
                borderRadius="24px"
                bg={addCardBg}
                boxShadow={tileShadow}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                h="220px"
                transition="all .18s ease"
                _hover={{ transform: "translateY(-6px)" }}
              >
                <Box
                  w="64px"
                  h="64px"
                  borderRadius="16px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bgGradient="linear(to-b,#6b46ff,#805ad5)"
                >
                  <AddIcon boxSize={7} color="white" />
                </Box>
                <VStack spacing={1} mt={3}>
                  <Text fontWeight="700">Add Videos</Text>
                  <Text fontSize="xs" color="gray.500">
                    {safeVideos.length} video
                    {safeVideos.length === 1 ? "" : "s"}
                  </Text>
                </VStack>
              </Box>
            </GridItem>

            {/* Video tiles */}
            {safeVideos.length > 0 ? (
              safeVideos.map((vid, idx) => (
                <GridItem key={vid.id}>
                  <Box
                    borderRadius="24px"
                    overflow="hidden"
                    bg={tileBg}
                    boxShadow={tileShadow}
                    h="220px"
                    position="relative"
                    transition="transform .18s ease"
                    _hover={{ transform: "translateY(-6px)" }}
                  >
                    <Box
                      onClick={() => openViewerAt(idx)}
                      cursor="pointer"
                      h="100%"
                    >
                      {/* lightweight preview: muted autoplay loop */}
                      <video
                        src={vid.url}
                        muted
                        playsInline
                        loop
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>

                    {/* menu */}
                    <Box position="absolute" top={3} right={3} zIndex={3}>
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
                            onClick={() => handleDownload(vid.url)}
                          >
                            Download
                          </MenuItem>
                          <MenuItem
                            icon={<FiTrash2 />}
                            onClick={() => handleDelete(vid)}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Box>

                    {/* badge */}
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
                        {vid.createdByName || "Guest"}{" "}
                        {vid.createdAt
                          ? `• ${(() => {
                              const seconds = Math.floor(
                                (Date.now() -
                                  (vid.createdAt?.toDate
                                    ? vid.createdAt.toDate().getTime()
                                    : new Date(vid.createdAt).getTime())) /
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
                    No videos yet — be the first to upload a memory ✨
                  </Text>
                </Flex>
              </GridItem>
            )}
          </Grid>
        )}
      </Box>

      {/* Viewer */}
      <Viewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        videos={safeVideos}
        startIndex={viewerIndex}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default Videos;
