// src/pages/Gallery.js
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useCollection } from "../hooks/useCollection";
import { useEvent } from "../hooks/useEvent";
import { useDocument } from "../hooks/useDocument";
import { useFirestore } from "../hooks/useFirestore";
import { Skeleton } from "@chakra-ui/react";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Flex,
  HStack,
  IconButton,
  Tag,
  Center,
  Image as ChakraImage,
  Button,
} from "@chakra-ui/react";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  Box,

  Text,
  Spinner,
 
  useColorModeValue,

  ModalCloseButton,
  useDisclosure,
  
  Grid,
  GridItem,
 
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
 
 
  Tooltip,
  
  Fade,
  Checkbox,
} from "@chakra-ui/react";

import { AddIcon } from "@chakra-ui/icons";
import {
  FiMoreHorizontal,
 
 
  
  FiDownload,
  FiTrash2,
} from "react-icons/fi";

import UniversalUploadModal from "../components/UniversalUploadModal";
import ImageCardSkeleton from "../components/ImageCardSkeleton";

import {
  downloadImage,
  downloadUrlsAsZip,
  downloadFolderAsZip,
} from "../utils/downloads";
const primaryBg = "#EBD9A6";
const primaryHover = "#D1B7A1";
const primaryText = "#3A2F2A";
const softBorder = "#a57256";
/* ------------------ Utilities ------------------ */
function timeAgoFromTimestamp(ts) {
  if (!ts) return "";
  const t = ts?.toDate ? ts.toDate().getTime() : new Date(ts).getTime();
  const seconds = Math.floor((Date.now() - t) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getUploaderUid(img) {
  return img?.createdBy || null;
}

function canUserDeleteImage(user, img, isAdmin = false) {
  if (isAdmin) return true;
  if (!user || !img) return false;

  // support both schemas
  const uploaderId = img.createdBy || img.userId;

  return uploaderId === user.uid;
}

/* ------------------ Viewer Modal ------------------ */


/* ============================
   FULLSCREEN VIEWER
   (SAFE TO MODIFY)
============================ */

const Viewer = ({
  isOpen,
  onClose,

  images = [],          // 🔹 all images
  startIndex = 0,       // 🔹 index clicked from grid

  currentUser,          // 🔹 for delete permission
  isAdmin,              // 🔹 owner/host flag
  onDelete,             // 🔹 delete handler from Gallery
}) => {
  /* ---------------- STATE ---------------- */
  const [index, setIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);      // 🔹 zoom level
  const [autoPlay, setAutoPlay] = useState(false);
const [imgLoading, setImgLoading] = useState(true);



  /* ---------------- REFS ---------------- */
  const lastTap = useRef(0);                   // 🔹 double-tap detect
  const touch = useRef({
    startX: 0,
    lastTime: 0,
    pinchDist: null,
  });

  const preloaded = useRef(new Set());          // 🔹 prefetch cache
  const PREFETCH_LIMIT = 5;                     // 🔹 change if needed

  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[index] : null;

  /* ---------------- PERMISSIONS ---------------- */
  const canDelete =
    isAdmin ||
    (currentUser &&
      (currentImage?.createdBy === currentUser.uid ||
       currentImage?.userId === currentUser.uid));

  /* ---------------- RESET ZOOM ---------------- */
  const resetTransform = () => setScale(1);

  /* ---------------- OPEN SYNC ---------------- */
  useEffect(() => {
    setIndex(startIndex);
    resetTransform();
  }, [startIndex, isOpen]);

useEffect(() => {
  if (!preloaded.current.has(index)) {
    setImgLoading(true);
  }
}, [index]);

  /* ---------------- KEYBOARD (⬅ ➡ ESC) ---------------- */
  useEffect(() => {
    if (!isOpen || !hasImages) return;

    const onKey = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, hasImages]);

  /* ---------------- AUTOPLAY ---------------- */
  useEffect(() => {
    if (!autoPlay || !isOpen || !hasImages) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
      resetTransform();
    }, 3000); // 🔹 change speed here (ms)

    return () => clearInterval(id);
  }, [autoPlay, isOpen, hasImages, images.length]);

  /* ---------------- PREFETCH (FAST SLIDES) ---------------- */
  useEffect(() => {
    if (!hasImages) return;

    const preload = (i) => {
      if (!images[i]) return;
      if (preloaded.current.has(i)) return;

      const img = new window.Image();   // ⚠️ MUST be window.Image
      img.src = images[i].url;

      preloaded.current.add(i);

      if (preloaded.current.size > PREFETCH_LIMIT) {
        const first = preloaded.current.values().next().value;
        preloaded.current.delete(first);
      }
    };

    preload((index + 1) % images.length);
    preload((index - 1 + images.length) % images.length);
  }, [index, hasImages, images]);

  /* ---------------- NAVIGATION ---------------- */
const next = () => {
  setImgLoading(true);
  setIndex((i) => (i + 1) % images.length);
  resetTransform();
  setAutoPlay(false);
};

const prev = () => {
  setImgLoading(true);
  setIndex((i) => (i - 1 + images.length) % images.length);
  resetTransform();
  setAutoPlay(false);
};


  /* ---------------- TOUCH / SWIPE ---------------- */
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      touch.current.startX = e.touches[0].clientX;
      touch.current.lastTime = Date.now();
    }

    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touch.current.pinchDist = Math.hypot(dx, dy);
    }
  };

  const onTouchMove = (e) => {
    if (e.touches.length === 2 && touch.current.pinchDist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);

      setScale((s) =>
        Math.min(3, Math.max(1, s * (dist / touch.current.pinchDist)))
      );

      touch.current.pinchDist = dist;
    }
  };

  const onTouchEnd = (e) => {
    if (touch.current.pinchDist) {
      touch.current.pinchDist = null;
      return;
    }

    const dx = e.changedTouches[0].clientX - touch.current.startX;
    const dt = Date.now() - touch.current.lastTime;
    const velocity = dx / dt;

    if (Math.abs(dx) > 80 || Math.abs(velocity) > 0.5) {
      dx < 0 ? next() : prev();
    }
  };

  /* ---------------- DOUBLE TAP ZOOM ---------------- */
  const onDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setScale((s) => (s === 1 ? 2 : 1));
      setAutoPlay(false);
    }
    lastTap.current = now;
  };

  if (!hasImages) return null;

  /* ---------------- RENDER ---------------- */
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      trapFocus={false} // 🔹 REQUIRED for keyboard arrows
      autoFocus={false}
    >
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg="transparent" boxShadow="none">
        <ModalBody p={0} h="100vh">
          {/* ===== TOP BAR ===== */}
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
                {index + 1} / {images.length}
              </Tag>
            </HStack>

            <HStack>
              {/* DOWNLOAD */}
              <IconButton
                icon={<FiDownload />}
                onClick={() =>
                  downloadImage(
                    currentImage.url,
                    currentImage.filename || "photo"
                  )
                }
              />

              {/* DELETE (permission based) */}
              {canDelete && (
                <IconButton
                  icon={<FiTrash2 />}
                  color="red.500"
                  onClick={() => onDelete(currentImage)}
                />
              )}

              {/* PLAY / STOP */}
              <Button size="sm" onClick={() => setAutoPlay((s) => !s)}>
                {autoPlay ? "Stop" : "Play"}
              </Button>
            </HStack>
          </Flex>

          {/* ===== IMAGE ===== */}
          {/* ===== IMAGE ===== */}
          <Center
            h="100%"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={onDoubleTap}
          >
            <Box position="relative">
              {/* Skeleton */}
              {imgLoading && (
                <Box
                  position="absolute"
                  inset={0}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  pointerEvents="none"
                >
                  <Skeleton
                    height="40vh"
                    width="40vw"
                    maxW="600px"
                    borderRadius="lg"
                    startColor="blackAlpha.200"
                    endColor="blackAlpha.400"
                    fadeDuration={0.15}
                  />
                </Box>
              )}

              {/* Image */}
              <ChakraImage
                src={currentImage.url}
                maxH="90vh"
                maxW="95vw"
                objectFit="contain"
                transform={`scale(${scale})`}
                transition="transform 0.25s ease, opacity 0.25s ease"
                opacity={imgLoading ? 0.4 : 1}
                draggable={false}
                onLoad={() => setImgLoading(false)}
                onError={() => setImgLoading(false)}
              />
            </Box>
          </Center>

          {/* ===== ARROWS ===== */}
          <IconButton
            icon={<FiChevronLeft />}
            position="absolute"
            left={2}
            top="50%"
            zIndex={50}
            onClick={prev}
          />
          <IconButton
            icon={<FiChevronRight />}
            position="absolute"
            right={2}
            top="50%"
            zIndex={50}
            onClick={next}
          />

          {/* ===== BOTTOM INFO ===== */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            px={4}
            py={3}
            bg="#f9f7eeff"
            borderTop={`1px solid ${softBorder}`}
          >
            <Text fontSize="sm" fontWeight="600" color={primaryText}>
              {currentImage.uploaderName || "Guest"}
            </Text>
            <Text fontSize="xs" color="gray.600">
              {timeAgoFromTimestamp(currentImage.createdAt)}
            </Text>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};




/* ------------------ Gallery Page ------------------ */

const Gallery = ({ guestMode = false, allowUpload = true }) => {
  const { addDocument } = useFirestore("gallery");

const bg = "gray.50"; // same as Guestbook page

const tileBg = "#FFFFFF"; // clean guest cards
const tileShadow = "sm";




  const { id } = useParams();

  const { user } = useAuthContext();
  const { changeEvent } = useEvent();
  const { deleteDocument } = useFirestore("gallery");

  // -- NOTE: some useDocument hooks return an isPending/isLoading flag; try to capture it.
  const {
    document: eventDoc,
    error: eventError,
    isPending: eventLoadingRaw,
  } = useDocument("events", id);

  // normalize event loading flag: if hook doesn't return isPending, infer it
  const eventLoading =
    typeof eventLoadingRaw !== "undefined"
      ? eventLoadingRaw
      : !eventDoc && !eventError && !!id;

  const galleryQuery = ["eventId", "==", id];

  const {
    documents: images,
    error,
    isPending,
  } = useCollection("gallery", galleryQuery, ["createdAt", "desc"]);

  useEffect(() => {
    if (id) changeEvent(id);
  }, [id, changeEvent]);

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
  };

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
      const values = Object.values(eventDoc);
      for (const v of values) {
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

  // ---------------- SELECT / BATCH ACTIONS ----------------
  const [selected, setSelected] = useState(() => new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [zipProcessing, setZipProcessing] = useState(false);

  useEffect(() => {
    // clear selection if images changed/removed
    setSelected((prev) => {
      const next = new Set(
        [...prev].filter((id) => (images || []).some((im) => im.id === id))
      );
      return next;
    });
  }, [images]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set((images || []).map((i) => i.id)));
  const clearSelection = () => {
    setSelected(new Set());
    setSelectMode(false);
  };

  const downloadSelected = () => {
    if (selected.size === 0) return alert("No images selected");
    for (const id of selected) {
      const img = (images || []).find((i) => i.id === id);
      if (img) downloadImage(img.url, img.filename || img.id);
    }
    clearSelection();
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return alert("No images selected");
    for (const id of Array.from(selected)) {
      const img = (images || []).find((i) => i.id === id);
      if (!img) continue;
      if (!canUserDeleteImage(user, img, isAdmin)) {
        alert("You can only delete your own uploads");
        continue;
      }
      try {
        await deleteDocument(img.id);
      } catch (e) {
        console.error("Batch delete failed:", e);
      }
    }
    clearSelection();
  };

  // Download selected urls as zip
  const downloadSelectedAsZip = async () => {
    if (selected.size === 0) return alert("No images selected");
    setZipProcessing(true);
    try {
      const imgs = (images || []).filter((i) => selected.has(i.id));
      const items = imgs.map((i) => ({
        url: i.url,
        filename: i.filename || `${i.id}.jpg`,
      }));
      await downloadUrlsAsZip(items, {
        concurrency: 4,
        zipFilename: `photos-selected-${Date.now()}.zip`,
      });
      clearSelection();
      setSelectMode(false);
    } catch (err) {
      console.error("downloadSelectedAsZip failed:", err);
      alert("ZIP download failed: " + (err.message || err));
    } finally {
      setZipProcessing(false);
    }
  };

  const downloadAllAsZip = async () => {
    const imgs = images || [];
    if (imgs.length === 0) return alert("No images to download");
    setZipProcessing(true);
    try {
      const items = imgs.map((i) => ({
        url: i.url,
        filename: i.filename || `${i.id}.jpg`,
      }));
      await downloadUrlsAsZip(items, {
        concurrency: 4,
        zipFilename: `photos-all-${Date.now()}.zip`,
      });
      setSelectMode(false);
      setSelected(new Set());
    } catch (e) {
      console.error(e);
      alert("ZIP failed: " + (e.message || e));
    } finally {
      setZipProcessing(false);
    }
  };

  // ---------------- UI ----------------

  // Debug logging - helpful when intermittent "no event" happens
  useEffect(() => {
    console.debug("Gallery debug:", {
      id,
      eventDocPresent: !!eventDoc,
      eventError,
      eventLoading,
      collectionPending: isPending,
    });
  }, [id, eventDoc, eventError, eventLoading, isPending]);

  if (error || eventError) {
    console.error(
      "Gallery collection error:",
      error,
      "Event error:",
      eventError
    );
    return (
      <Flex minH="80vh" align="center" justify="center" direction="column">
        <Text color="red.500" fontWeight="bold">
          {error || eventError}
        </Text>
      </Flex>
    );
  }




  // if (guestMode && !user) {
  //   return (
  //     <Flex minH="80vh" align="center" justify="center">
  //       <Spinner />
  //       <Text ml={3}>Loading gallery...</Text>
  //     </Flex>
  //   );
  // }

if (!eventLoading && !eventDoc) {
  return (
    <Flex minH="80vh" align="center" justify="center" direction="column">
      <Text fontWeight="bold">No event found</Text>
      <Text fontSize="sm" color="gray.500">
        Event id: {id}
      </Text>
    </Flex>
  );
}


  // Guests can see ALL images
  const safeImages = images || [];

  const displayUploaderName = (img) => {
    if (img?.uploaderName && img.uploaderName !== "Guest")
      return img.uploaderName;
    if (img?.createdByName && img.createdByName !== "Guest")
      return img.createdByName;
    return "Guest";
  };
  const pageTitle = "Photos"; // static
  return (
    <Box
      minH="100vh"
      bg={bg}
      py={{ base: 10, md: 10 }}
      mt={{ base: 20, md: 10 }}
    >
      {/* Top row */}
      <Flex
        px={{ base: 3, md: 8 }}
        justify="space-between"
        mb={4}
        align="center"
      >
        <HStack spacing={3}>
          {isAdmin && (
            <Tag colorScheme="yellow" borderRadius="full" px={3} py={1}>
              Owner
            </Tag>
          )}
        </HStack>

        <HStack spacing={3}>
          <Button
            size="sm"
            variant="outline"
            borderRadius="full"
            onClick={() => setSelectMode((s) => !s)}
          >
            {selectMode ? "Exit select" : "Select images"}
          </Button>
        </HStack>
      </Flex>

      {eventLoading && (
        <Box px={{ base: 3, md: 8 }} mb={3}>
          <Skeleton
            height="14px"
            width="140px"
            borderRadius="md"
            startColor="#efe7da"
            endColor="#e0d4c2"
          />
        </Box>
      )}
      {/* Select-mode toolbar */}
      {selectMode && (
        <Fade in={selectMode}>
          <Flex
            px={{ base: 4, md: 8 }}
            py={3}
            mb={4}
            align="center"
            justify="space-between"
            bg="white"
            borderRadius="2xl"
            boxShadow="0 8px 24px rgba(0,0,0,0.08)"
            flexWrap="wrap"
            gap={3}
          >
            {/* LEFT */}
            <HStack spacing={3}>
              <Button
                size="sm"
                variant="ghost"
                fontWeight="600"
                onClick={selectAll}
              >
                Select all
              </Button>

              <Tag borderRadius="full" bg="gray.100" color="gray.700">
                {selected.size} selected
              </Tag>
            </HStack>

            {/* RIGHT ACTIONS */}
            <HStack spacing={2}>
              {/* DOWNLOAD */}
              <Button
                size="sm"
                borderRadius="full"
                bg="gray.900"
                color="white"
                leftIcon={<FiDownload color="white" />}
                _hover={{ bg: "gray.800" }}
                isDisabled={selected.size === 0}
                onClick={downloadSelected}
              >
                Download
              </Button>

              {/* ZIP */}
              <Button
                size="sm"
                borderRadius="full"
                variant="outline"
                leftIcon={<FiDownload />}
                isDisabled={selected.size === 0}
                onClick={downloadSelectedAsZip}
              >
                ZIP
              </Button>

              {/* DELETE */}
              <Button
                size="sm"
                borderRadius="full"
                variant="ghost"
                color="red.600"
                leftIcon={<FiTrash2 color="red" />}
                _hover={{ bg: "red.50" }}
                isDisabled={selected.size === 0}
                onClick={deleteSelected}
              >
                Delete
              </Button>

              {/* CLEAR */}
              <Button
                size="sm"
                borderRadius="full"
                variant="ghost"
                onClick={clearSelection}
              >
                Clear
              </Button>
            </HStack>
          </Flex>
        </Fade>
      )}

      {allowUpload && (
        <UniversalUploadModal
          isOpen={uploadOpen}
          onClose={closeUpload}
          eventId={id}
          user={user}
          accept="image/*"
          onUploadComplete={async ({ mediaUrl, file }) => {
            await addDocument({
              eventId: id,
              url: mediaUrl,
              filename: file?.name || "image",
              createdAt: new Date(),
              createdBy: user?.uid || null,
              uploaderName: user?.displayName || "Guest",
            });
          }}
        />
      )}

      {/* Gallery Grid */}
      <Box px={{ base: 3, md: 8 }} py={{ base: 4, md: 10 }} mx="auto" w="100%">
        {eventLoading || isPending ? (
          <Grid
            templateColumns={{
              base: "repeat(3, 1fr)",
              sm: "repeat(4, 1fr)",
              md: "repeat(5, 1fr)",
              lg: "repeat(6, 1fr)",
            }}
            gap={1}
          >
            {[...Array(12)].map((_, i) => (
              <ImageCardSkeleton key={i} />
            ))}
          </Grid>
        ) : (
          <Grid
            templateColumns={{
              base: "repeat(3, 1fr)", // mobile Instagram feel
              sm: "repeat(4, 1fr)",
              md: "repeat(5, 1fr)",
              lg: "repeat(6, 1fr)",
            }}
            gap={1}
          >
            {safeImages.map((img, idx) => {
              const canDelete = canUserDeleteImage(user, img, isAdmin);

              return (
                <GridItem key={img.id}>
                  <Box
                    position="relative"
                    bg={tileBg}
                    aspectRatio={1}
                    cursor={selectMode ? "default" : "pointer"}
                    border={
                      selected.has(img.id)
                        ? `2px solid ${primaryHover}`
                        : "1px solid #eee"
                    }
                    transition="transform 0.15s ease"
                    _hover={{
                      transform: selectMode ? "none" : "scale(1.01)",
                    }}
                    onClick={() =>
                      selectMode ? toggleSelect(img.id) : openViewerAt(idx)
                    }
                  >
                    {/* selection checkbox - only visible in selectMode, clickable area stops propagation */}
                    {selectMode && (
                      <Box
                        position="absolute"
                        top={3}
                        left={3}
                        zIndex={30}
                        onClick={(e) => e.stopPropagation()}
                        bg="#f9f7eeff"
                        backdropFilter="blur(6px)"
                        borderRadius="md"
                        p={1}
                        border={
                          selected.has(img.id) ? "3px solid #d4af37" : "none"
                        }
                      >
                        <Checkbox
                          isChecked={selected.has(img.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelect(img.id);
                          }}
                          size="lg"
                          aria-label={`Select ${img.filename || "photo"}`}
                          bg="rgba(255,255,255,0.95)"
                          borderRadius="md"
                        />
                      </Box>
                    )}

                    <ChakraImage
                      src={img.url}
                      alt={img.filename || "photo"}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />

                    {/* <Box
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      px={3}
                      py={2}
                     bgGradient="linear(to-t, rgba(249,247,238,0.95), rgba(249,247,238,0))"
                    >
                      <Text fontSize="xs" color="whiteAlpha.900">
                        {displayUploaderName(img)}
                        {img.createdAt
                          ? ` • ${timeAgoFromTimestamp(img.createdAt)}`
                          : ""}
                      </Text>
                    </Box> */}
                  </Box>
                </GridItem>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Footer selection bar */}
      {selectMode && selected.size > 0 && (
        <Flex
          mt={4}
          p={3}
          borderRadius="md"
          bg="rgba(212,175,55,0.06)"
          align="center"
          justify="space-between"
        >
          <Text fontSize="sm" color="gray.700">
            {selected.size} selected
          </Text>
          <HStack>
            <Button
              size="sm"
              bg="#d4af37"
              color="black"
              onClick={downloadSelected}
            >
              <FiDownload style={{ marginRight: 6 }} />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              borderColor="red.400"
              color="red.400"
              onClick={deleteSelected}
            >
              <FiTrash2 style={{ marginRight: 6 }} />
              Delete
            </Button>
            <Button size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </HStack>
        </Flex>
      )}

      {/* Viewer */}

      <Viewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={safeImages}
        startIndex={viewerIndex}
        currentUser={user}
        isAdmin={isAdmin}
        onDelete={handleDelete}
      />

      {allowUpload && (
        <Box
          position="fixed"
          bottom={{ base: 4, md: 6 }}
          right={{ base: 4, md: 8 }}
          zIndex={1000}
        >
          <Button
            onClick={openUpload}
            leftIcon={<AddIcon />}
            bg={primaryBg}
            color={primaryText}
            _hover={{ bg: primaryHover }}
            borderRadius="full"
            px={6}
            py={6}
            boxShadow="lg"
          >
            Add Photos
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Gallery;
