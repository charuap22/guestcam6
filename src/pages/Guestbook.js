// src/pages/Guestbook.js
import React, { useState, useMemo } from "react";
import {
  Box,
  Flex,
  chakra,
  Button,
  Stack,
  Textarea,
  useToast,
  VStack,
  Avatar,
  Text,
  Center,
  AspectRatio,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FiTrash2 } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { timestamp } from "../firebase/config";
import { useAuthContext } from "../hooks/useAuthContext";
import { useDocument } from "../hooks/useDocument";
import { useFirestore } from "../hooks/useFirestore";

import VideoUploadForm from "../components/VideoUploadForm";

const PAGE_SIZE_VIDEOS = 12;
const PAGE_SIZE_TEXT = 20;

const Guestbook = () => {
  const { id, userType } = useParams();
  const { user } = useAuthContext();
  const { document: eventDoc, error: docError } = useDocument("events", id);
  const { updateDocument, response } = useFirestore("events");
  const toast = useToast();

  const [newComment, setNewComment] = useState("");
  const [videoCount, setVideoCount] = useState(PAGE_SIZE_VIDEOS);
  const [textCount, setTextCount] = useState(PAGE_SIZE_TEXT);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);

  const {
    isOpen: videoUploadOpen,
    onOpen: openVideoUpload,
    onClose: closeVideoUpload,
  } = useDisclosure();
  const {
    isOpen: videoViewerOpen,
    onOpen: openVideoViewer,
    onClose: closeVideoViewer,
  } = useDisclosure();

  const isAdmin =
    (typeof userType === "string" && userType.toLowerCase() === "admin") ||
    false;

  const guestBookSafe =
    eventDoc && Array.isArray(eventDoc.guestBook) ? eventDoc.guestBook : [];

  const { textEntriesAll, videoEntriesAll } = useMemo(() => {
    const texts = [];
    const vids = [];
    for (const e of guestBookSafe) {
      if (e?.type === "video" && (e.videoUrl || e.videoURL || e.url))
        vids.push(e);
      else texts.push(e);
    }
    const sortNewest = (arr) =>
      arr.sort((a, b) => {
        const ta = a.createdAt?.toDate
          ? a.createdAt.toDate().getTime()
          : new Date(a.createdAt).getTime();
        const tb = b.createdAt?.toDate
          ? b.createdAt.toDate().getTime()
          : new Date(b.createdAt).getTime();
        return tb - ta;
      });
    sortNewest(texts);
    sortNewest(vids);
    return { textEntriesAll: texts, videoEntriesAll: vids };
  }, [guestBookSafe]);

  const videoEntries = videoEntriesAll;
  const textEntries = textEntriesAll;

  const visibleVideos = videoEntries.slice(0, videoCount);
  const visibleText = textEntries.slice(0, textCount);

  const timeAgoFrom = (createdAt) => {
    if (!createdAt) return "";
    const ms = createdAt?.toDate
      ? createdAt.toDate().getTime()
      : new Date(createdAt).getTime();
    const s = Math.floor((Date.now() - ms) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  if (docError) return <div>Error loading event: {docError}</div>;
  if (!eventDoc)
    return (
      <Flex minH="50vh" align="center" justify="center">
        <Spinner />
      </Flex>
    );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newEntry = {
      id: uuidv4(),
      displayName: user?.displayName || "Guest",
      photoURL: user?.photoURL || "",
      userId: user?.uid,
      type: "text",
      content: newComment,
      createdAt: timestamp.fromDate(new Date()),
    };

    try {
      await updateDocument(eventDoc.id, {
        guestBook: [...(eventDoc.guestBook || []), newEntry],
      });
      if (!response.error) {
        setNewComment("");
        toast({
          title: "Message Sent!",
          description: "Your message has been added to the guestbook.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not send message — please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleVideoUploadComplete = async (meta = {}, extra = {}) => {
    const videoUrl = meta?.url || meta?.downloadURL || meta?.filePath || null;
    if (!videoUrl) return;

    const entry = {
      id: uuidv4(),
      displayName: user?.displayName || "Guest",
      photoURL: user?.photoURL || "",
      userId: user?.uid,
      type: "video",
      videoUrl,
      thumbnailDataUrl: extra?.thumbnailDataUrl || null,
      content: extra?.caption || "",
      createdAt: timestamp.fromDate(new Date()),
    };

    await updateDocument(eventDoc.id, {
      guestBook: [...(eventDoc.guestBook || []), entry],
    });
    closeVideoUpload();
    toast({
      title: "Video added",
      status: "success",
      duration: 2500,
      isClosable: true,
    });
  };

  const deleteEntry = async (entryId) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this guestbook entry?")) return;
    const updated = (eventDoc.guestBook || []).filter((e) => e.id !== entryId);
    await updateDocument(eventDoc.id, { guestBook: updated });
    toast({ title: "Deleted", status: "info", duration: 1500 });
  };

  const openVideo = (url) => {
    setCurrentVideoUrl(url);
    openVideoViewer();
  };

  const loadMoreVideos = () => setVideoCount((c) => c + PAGE_SIZE_VIDEOS);
  const loadMoreText = () => setTextCount((c) => c + PAGE_SIZE_TEXT);

  return (
    <Box
      minH="100vh"
      py={{ base: 10, md: 10 }}
      mt={{ base: 20, md: 10 }}
      bgImage="linear-gradient(180deg,#f7f8fb 0%, #ffffff 100%)"
    >
      <VStack
        px={{ base: 3, md: 8 }}
        py={{ base: 4, md: 10 }}
        mx="auto"
        w="100%"
        maxW="100%"
        spacing={8}
        align="stretch"
      >
        {/* Video Messages */}
        <Box>
          <Flex
            direction={{ base: "column", sm: "row" }}
            align={{ base: "flex-start", sm: "center" }}
            justify={{ base: "flex-start", sm: "space-between" }}
            gap={{ base: 3, sm: 0 }}
            mb={4}
          >
            <Text fontSize="lg" fontWeight="700" color="gray.700">
              Video Messages
            </Text>

            <Button
              leftIcon={<AddIcon />}
              colorScheme="purple"
              size="sm"
              onClick={openVideoUpload}
              alignSelf={{ base: "flex-start", sm: "auto" }}
            >
              Add Video Message
            </Button>
          </Flex>

          <Box
            sx={{
              columnCount: { base: 1, sm: 2, md: 3, lg: 4 },
              columnGap: "1rem",
            }}
          >
            {visibleVideos.length === 0 ? (
              <Center py={8} color="gray.500">
                No video messages yet.
              </Center>
            ) : (
              visibleVideos.map((v) => (
                <Box key={v.id} display="inline-block" width="100%" mb="1rem">
                  <Box
                    bg="white"
                    borderRadius="12px"
                    boxShadow="sm"
                    overflow="hidden"
                  >
                    <Box position="relative">
                      {v.thumbnailDataUrl ? (
                        <AspectRatio ratio={16 / 9}>
                          <img
                            src={v.thumbnailDataUrl}
                            alt={v.displayName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </AspectRatio>
                      ) : (
                        <AspectRatio ratio={16 / 9}>
                          <video
                            src={v.videoUrl}
                            playsInline
                            muted
                            preload="metadata"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </AspectRatio>
                      )}

                      {isAdmin && (
                        <IconButton
                          aria-label="delete"
                          icon={<FiTrash2 />}
                          size="sm"
                          colorScheme="red"
                          position="absolute"
                          top="6px"
                          right="6px"
                          onClick={() => deleteEntry(v.id)}
                        />
                      )}
                    </Box>

                    <Box p={3}>
                      <Flex align="center" justify="space-between">
                        <Flex align="center">
                          <Avatar
                            name={v.displayName}
                            src={v.photoURL}
                            size="sm"
                            mr={3}
                          />
                          <Box>
                            <Text fontWeight="600" fontSize="sm">
                              {v.displayName || "Guest"}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {timeAgoFrom(v.createdAt)}
                            </Text>
                          </Box>
                        </Flex>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openVideo(v.videoUrl)}
                        >
                          Play
                        </Button>
                      </Flex>
                      {v.content && (
                        <Text mt={2} fontSize="sm" color="gray.600">
                          {v.content}
                        </Text>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {videoEntries.length > visibleVideos.length && (
            <Center mt={6}>
              <Button onClick={loadMoreVideos}>Load more videos</Button>
            </Center>
          )}
        </Box>

        {/* Text Messages (multi-column masonry) */}
        <Box>
          <Text fontSize="lg" fontWeight="700" color="gray.700" mb={4}>
            Messages
          </Text>
          {/* Message Input */}
          <Flex
            align="center"
            justify="center"
            bg="white"
            p={6}
            borderRadius="2xl"
            boxShadow="lg"
          >
            <form onSubmit={handleSendMessage} style={{ width: "100%" }}>
              <Stack
                direction={{ base: "column", md: "row" }}
                spacing={4}
                w="100%"
              >
                <Textarea
                  required
                  placeholder="Write a message..."
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  _focus={{
                    borderColor: "purple.400",
                    boxShadow: "0 0 0 1px rgba(124,58,237,0.16)",
                  }}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  colorScheme="purple"
                  px={8}
                  py={6}
                  borderRadius="xl"
                  type="submit"
                >
                  Send
                </Button>
              </Stack>
            </form>
          </Flex>

          <Box
            sx={{
              columnCount: { base: 1, sm: 2, md: 3, lg: 4 },
              columnGap: "1rem",
            }}
            mt={10}
          >
            {visibleText.length === 0 ? (
              <Center py={8} color="gray.500">
                No messages yet — be the first ✨
              </Center>
            ) : (
              visibleText.map((entry) => (
                <Box
                  key={entry.id}
                  display="inline-block"
                  width="100%"
                  mb="1rem"
                >
                  <Box
                    bg="white"
                    p={{ base: 4, md: 5 }}
                    borderRadius="2xl"
                    boxShadow="0 4px 20px rgba(15,23,42,0.06)"
                    position="relative"
                  >
                    {isAdmin && (
                      <IconButton
                        aria-label="delete"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        position="absolute"
                        top="6px"
                        right="6px"
                        onClick={() => deleteEntry(entry.id)}
                      />
                    )}
                    <Flex align="center" mb={3}>
                      <Avatar
                        name={entry.displayName}
                        src={entry.photoURL}
                        size="sm"
                        mr={3}
                      />
                      <Box>
                        <Text fontWeight="600" fontSize="sm">
                          {entry.displayName || "Guest"}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {timeAgoFrom(entry.createdAt)}
                        </Text>
                      </Box>
                    </Flex>
                    <Text fontSize="sm" color="gray.600">
                      {entry.content}
                    </Text>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {textEntries.length > visibleText.length && (
            <Center mt={6}>
              <Button onClick={loadMoreText}>Load more messages</Button>
            </Center>
          )}
        </Box>
      </VStack>

      {/* Video Upload Modal */}
      <Modal
        isOpen={videoUploadOpen}
        onClose={closeVideoUpload}
        size="lg"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="lg">
          <ModalCloseButton />
          <ModalBody p={6}>
            <VideoUploadForm
              user={user}
              onUploadComplete={(meta, extra) =>
                handleVideoUploadComplete(meta, extra)
              }
              onClose={closeVideoUpload}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Video Viewer Modal */}
      <Modal
        isOpen={videoViewerOpen}
        onClose={() => {
          setCurrentVideoUrl(null);
          closeVideoViewer();
        }}
        size="xl"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" boxShadow="none" maxW="90vw">
          <ModalBody p={0}>
            <Box borderRadius="md" overflow="hidden">
              <AspectRatio ratio={16 / 9}>
                <video
                  src={currentVideoUrl}
                  controls
                  style={{ width: "100%" }}
                />
              </AspectRatio>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Floating Add-Video Button */}
      {/* <IconButton
        aria-label="Add video"
        icon={<AddIcon />}
        colorScheme="purple"
        position="fixed"
        right={{ base: 4, md: 12 }}
        bottom={{ base: 4, md: 12 }}
        zIndex={50}
        borderRadius="full"
        onClick={openVideoUpload}
      /> */}
    </Box>
  );
};

export default Guestbook;
