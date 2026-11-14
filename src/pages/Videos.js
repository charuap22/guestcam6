import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Spinner,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  HStack,
  Grid,
  GridItem,
  IconButton,
  Tag,
  Center,
  Fade,
  Checkbox,
  Image,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiPlay,
  FiPause,
  FiX,
  FiDownload,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { AddIcon } from "@chakra-ui/icons";

import { useAuthContext } from "../hooks/useAuthContext";
import { useCollection } from "../hooks/useCollection";
import { useEvent } from "../hooks/useEvent";
import { useDocument } from "../hooks/useDocument";
import { useFirestore } from "../hooks/useFirestore";

import UniversalUploadModal from "../components/UniversalUploadModal";
import ImageCardSkeleton from "../components/ImageCardSkeleton";
import { downloadImage, downloadUrlsAsZip } from "../utils/downloads";
import { AspectRatio } from "@chakra-ui/react";

/* ---------------- utilities ---------------- */

function timeAgoFromTimestamp(ts) {
  if (!ts) return "";
  const t = ts?.toDate ? ts.toDate().getTime() : new Date(ts).getTime();
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function getUploaderUid(v) {
  return v?.createdBy || v?.userId || v?.uploaderUid || null;
}

function canUserDeleteVideo(user, video, isAdmin) {
  if (!video) return false;
  if (isAdmin) return true;
  if (!user) return false;

  const uploaderId =
    video.uploaderUid ||
    video.userId ||
    video.createdBy ||
    video.createdByUid ||
    null;

  return uploaderId === user.uid;
}


/* ---------------- viewer ---------------- */

const Viewer = ({
  isOpen,
  onClose,
  videos,
  startIndex,
  currentUser,
  isAdmin,
  onDelete,
}) => {
  const [index, setIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const startX = useRef(0);

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    v.play().catch(() => {});
    setIsPlaying(true);
  }, [index, isOpen]);

  /* preload */
  useEffect(() => {
    if (!videos?.length) return;
    [index + 1, index - 1].forEach((i) => {
      if (videos[i]) {
        const v = document.createElement("video");
        v.src = videos[i].url;
        v.preload = "auto";
      }
    });
  }, [index, videos]);

  /* keyboard */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index < videos.length - 1)
        setIndex((i) => i + 1);
      if (e.key === "ArrowLeft" && index > 0) setIndex((i) => i - 1);
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, index, videos.length]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
    setIsPlaying(!v.paused);
  };

  const onPointerDown = (e) => {
    startX.current = e.clientX || e.touches?.[0]?.clientX;
  };

  const onPointerUp = (e) => {
    const endX = e.clientX || e.changedTouches?.[0]?.clientX;
    const dx = startX.current - endX;
    if (Math.abs(dx) < 60) return;
    if (dx > 0 && index < videos.length - 1) setIndex((i) => i + 1);
    if (dx < 0 && index > 0) setIndex((i) => i - 1);
  };

  if (!videos?.length) return null;
  const current = videos[index];
  const canDelete = canUserDeleteVideo(currentUser, current, isAdmin);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      motionPreset="none"
      scrollBehavior="inside"
    >
      <ModalOverlay bg="black" />
      <ModalContent m={0} maxW="100vw" h="100vh" bg="black" borderRadius="0">
        <ModalBody p={0} position="relative">
          {/* top bar */}
          <Flex
            position="absolute"
            top={3}
            left={3}
            right={3}
            zIndex={50}
            justify="space-between"
          >
            <HStack>
              <IconButton icon={<FiX />} onClick={onClose} />
              <Tag>
                {index + 1} / {videos.length}
              </Tag>
            </HStack>
            <HStack>
              <IconButton
                icon={isPlaying ? <FiPause /> : <FiPlay />}
                onClick={togglePlay}
              />
              <IconButton
                icon={<FiDownload />}
                onClick={() => downloadImage(current.url)}
              />
              {canDelete && (
                <IconButton
                  icon={<FiTrash2 />}
                  color="red.500"
                  onClick={() => onDelete(current)}
                />
              )}
            </HStack>
          </Flex>

          {/* arrows */}
          <IconButton
            icon={<FiChevronLeft />}
            position="absolute"
            left={2}
            top="50%"
            onClick={() => setIndex((i) => i - 1)}
            isDisabled={index === 0}
          />
          <IconButton
            icon={<FiChevronRight />}
            position="absolute"
            right={2}
            top="50%"
            onClick={() => setIndex((i) => i + 1)}
            isDisabled={index === videos.length - 1}
          />

          {/* video */}
          <Center
            w="100%"
            h="100vh"
            bg="black"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <video
              ref={videoRef}
              src={current.url}
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "black",
              }}
            />
          </Center>

          {/* footer */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            px={4}
            py={3}
            bg="rgba(0,0,0,0.6)"
          >
            <Text color="white" fontWeight="600">
              {current.uploaderName || "Guest"}
            </Text>
            <Text color="whiteAlpha.700" fontSize="xs">
              {timeAgoFromTimestamp(current.createdAt)}
            </Text>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

/* ---------------- page ---------------- */

export default function Videos() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const { changeEvent } = useEvent();
  const { deleteDocument } = useFirestore("videos");
  const bg = useColorModeValue("gray.50", "gray.900");
const [previewId, setPreview] = useState(null);

const touchTimer = useRef(null);

const handleTouchStart = (id) => {
  if (selectMode) return; // 🚫 no preview in select mode

  touchTimer.current = setTimeout(() => {
    setPreview(id);
  }, 250); // ⏱ long-press delay
};

const handleTouchEnd = () => {
  clearTimeout(touchTimer.current);
  setPreview(null);
};


const { documents: videosRaw, isPending } = useCollection(
  "videos",
  ["eventId", "==", id],
  ["createdAt", "desc"]
);

const videos = videosRaw || [];


 const { document: eventDoc } = useDocument("events", id);

 const [isAdmin, setIsAdmin] = useState(false);

 useEffect(() => {
   if (!user || !eventDoc) {
     setIsAdmin(false);
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

   setIsAdmin(ownerMatch);
 }, [user, eventDoc]);



  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [zipProcessing, setZipProcessing] = useState(false);

  const {
    isOpen: uploadOpen,
    onOpen: openUpload,
    onClose: closeUpload,
  } = useDisclosure();

  useEffect(() => {
    if (id) changeEvent(id);
  }, [id, changeEvent]);

  const openViewerAt = (i) => {
    setViewerIndex(i);
    setViewerOpen(true);
  };

  const toggleSelect = (id) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAll = () => setSelected(new Set(videos.map((v) => v.id)));
  const clearSelection = () => {
    setSelected(new Set());
    setSelectMode(false);
  };

  const downloadZip = async () => {
    if (selected.size === 0) return;
    setZipProcessing(true);
    try {
      await downloadUrlsAsZip(
        videos
          .filter((v) => selected.has(v.id))
          .map((v) => ({
            url: v.url,
            filename: v.filename || `${v.id}.mp4`,
          })),
        { zipFilename: `videos-${Date.now()}.zip` }
      );
      clearSelection();
    } finally {
      setZipProcessing(false);
    }
  };
const { addDocument } = useFirestore("videos");
const handleDelete = async (video) => {
  if (!canUserDeleteVideo(user, video, isAdmin)) {
    alert("You can only delete your own videos");
    return;
  }

  if (!window.confirm("Delete this video?")) return;

  await deleteDocument(video.id);
};

  return (
    <Box
      minH="100vh"
      bg={bg}
      py={{ base: 10, md: 10 }}
      mt={{ base: 20, md: 10 }}
    >
      {/* header */}
      <Flex
        px={{ base: 3, md: 8 }}
        justify="space-between"
        mb={4}
        align="center"
      >
        <HStack>{isAdmin && <Tag colorScheme="yellow">Owner</Tag>}</HStack>
        <Button
          size="sm"
          variant="outline"
          borderRadius="full"
          onClick={() => setSelectMode((s) => !s)}
        >
          {selectMode ? "Exit select" : "Select videos"}
        </Button>
      </Flex>

      {/* select toolbar (IDENTICAL STRUCTURE) */}
      {selectMode && (
        <Fade in>
          <Flex
            px={{ base: 4, md: 8 }}
            py={3}
            mb={4}
            bg="white"
            borderRadius="2xl"
            boxShadow="lg"
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={3}
          >
            <HStack>
              <Button size="sm" variant="ghost" onClick={selectAll}>
                Select all
              </Button>
              <Tag>{selected.size} selected</Tag>
            </HStack>
            <HStack>
              <Button
                size="sm"
                bg="gray.900"
                color="white"
                leftIcon={<FiDownload />}
                isDisabled={!selected.size}
                onClick={downloadZip}
              >
                {zipProcessing ? "Zipping…" : "ZIP"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                color="red.600"
                leftIcon={<FiTrash2 />}
                onClick={async () => {
                  for (const id of selected) {
                    const video = videos.find((v) => v.id === id);

                    if (!canUserDeleteVideo(user, video, isAdmin)) {
                      alert("You can only delete your own videos");
                      continue;
                    }

                    await deleteDocument(id); // ✅ moved INSIDE loop
                  }

                  clearSelection();
                }}
              >
                Delete
              </Button>

              <Button size="sm" variant="ghost" onClick={clearSelection}>
                Clear
              </Button>
            </HStack>
          </Flex>
        </Fade>
      )}

      {/* grid */}
      <Box px={{ base: 3, md: 8 }}>
        <Grid
          templateColumns={{
            base: "repeat(3,1fr)",
            sm: "repeat(4,1fr)",
            md: "repeat(5,1fr)",
            lg: "repeat(6,1fr)",
          }}
          gap={1}
        >
          {isPending
            ? [...Array(12)].map((_, i) => <ImageCardSkeleton key={i} />)
            : videos.map((v, i) => (
                <GridItem key={v.id}>
                  <Box
                    position="relative"
                    w="100%"
                    pt="100%" // 🔒 square
                    overflow="hidden"
                    cursor={selectMode ? "default" : "pointer"}
                    onMouseEnter={() =>
                      !selectMode &&
                      v.status !== "processing" &&
                      setPreview(v.id)
                    }
                    onMouseLeave={() => setPreview(null)}
                    onTouchStart={() =>
                      !selectMode &&
                      v.status !== "processing" &&
                      handleTouchStart(v.id)
                    }
                    onTouchEnd={handleTouchEnd}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectMode) {
                        toggleSelect(v.id);
                        return;
                      }
                      if (v.status === "processing") return;
                      openViewerAt(i);
                    }}
                  >
                    {/* CONTENT */}
                    <Box
                      position="absolute"
                      inset={0}
                      bgImage={v.thumbUrl ? `url(${v.thumbUrl})` : "none"}
                      bgSize="cover" // ✅ SAME AS PREVIEW
                      bgPosition="center" // ✅ CENTER CROP
                      bgRepeat="no-repeat"
                      display={previewId === v.id ? "none" : "block"}
                    />

                    {/* Preview video */}
                    {previewId === v.id && v.previewUrl && (
                      <video
                        src={v.previewUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}

                    {/* Play icon */}
                    <Center position="absolute" inset={0} pointerEvents="none">
                      <Box bg="blackAlpha.600" borderRadius="full" p={2}>
                        <FiPlay color="white" />
                      </Box>
                    </Center>

                    {/* Processing */}
                    {v.status === "processing" && (
                      <Center
                        position="absolute"
                        inset={0}
                        bg="blackAlpha.400"
                        color="white"
                        fontWeight="600"
                      >
                        Processing…
                      </Center>
                    )}

                    {/* selected overlay */}
                    {selectMode && selected.has(v.id) && (
                      <Box
                        position="absolute"
                        inset={0}
                        bg="blackAlpha.400"
                        zIndex={5}
                      />
                    )}

                    {/* checkmark */}
                    {selectMode && (
                      <Box
                        position="absolute"
                        top={2}
                        left={2}
                        zIndex={10}
                        bg={selected.has(v.id) ? "#d4af37" : "white"}
                        color={selected.has(v.id) ? "black" : "gray.400"}
                        borderRadius="full"
                        w="22px"
                        h="22px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="bold"
                      >
                        {selected.has(v.id) ? "✓" : ""}
                      </Box>
                    )}
                  </Box>
                </GridItem>
              ))}
        </Grid>
      </Box>

      {/* upload */}
      <UniversalUploadModal
        isOpen={uploadOpen}
        onClose={closeUpload}
        eventId={id}
        user={user}
        accept="video/*"
        onUploadComplete={async ({ mediaUrl, file, type, storagePath }) => {
          if (type !== "video") return;

          await addDocument({
            eventId: id,
            url: mediaUrl,
            filename: file?.name || "video",
            storagePath, // ✅ EXACT MATCH
            createdAt: new Date(),
            userId: user.uid,
            createdBy: user.uid,

            // ✅ RAW name only
            uploaderName: user?.displayName || "Guest",
            status: "processing",
            thumbUrl: null,
            previewUrl: null,
          });
          console.log("FIRESTORE STORAGE PATH:", storagePath);
        }}
      />

      <Box
        position="fixed"
        bottom={{ base: 4, md: 6 }}
        right={{ base: 4, md: 8 }}
      >
        <Button
          onClick={openUpload}
          leftIcon={<AddIcon />}
          bg="#EBD9A6"
          color="#3A2F2A"
          _hover={{ bg: "#D1B7A1" }}
          borderRadius="full"
          px={6}
          py={6}
          boxShadow="lg"
        >
          Add Videos
        </Button>
      </Box>

      <Viewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        videos={videos}
        startIndex={viewerIndex}
        currentUser={user}
        isAdmin={isAdmin}
        onDelete={handleDelete}
      />
    </Box>
  );
}
