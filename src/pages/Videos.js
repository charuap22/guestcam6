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
  Checkbox,
} from "@chakra-ui/react";

import { AddIcon } from "@chakra-ui/icons";
import { FiMoreHorizontal, FiX, FiDownload, FiTrash2 } from "react-icons/fi";

import VideoUploadForm from "../components/VideoUploadForm";
import ImageCardSkeleton from "../components/ImageCardSkeleton";

import {
  downloadImage,
  downloadUrlsAsZip,
  downloadFolderAsZip,
} from "../utils/downloads";

/* ----------------- Utilities ----------------- */

function timeAgoFromTimestamp(ts) {
  if (!ts) return "";
  const t = ts?.toDate ? ts.toDate().getTime() : new Date(ts).getTime();
  const seconds = Math.floor((Date.now() - t) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getUploaderUid(item) {
  if (!item) return null;
  return (
    item.uploaderUid ||
    item.userId ||
    item.uploader_id ||
    item.createdBy ||
    item.createdByUid ||
    null
  );
}

/** Permission helper - owner (isAdmin) or uploader can delete */
function canUserDeleteVideo(user, vid, isAdmin = false) {
  if (!vid) return false;
  if (isAdmin) return true;
  if (!user) return false;
  const uploaderId = getUploaderUid(vid);
  return uploaderId && uploaderId === user.uid;
}

/* ----------------- Viewer Modal ----------------- */

const Viewer = ({
  isOpen,
  onClose,
  videos,
  startIndex,
  onDelete,
  currentUserId,
  isAdmin,
}) => {
  const [index, setIndex] = useState(startIndex || 0);
  const videoRef = useRef(null);

  useEffect(() => {
    setIndex(startIndex || 0);
  }, [startIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, [isOpen, index]);

  if (!videos || videos.length === 0) return null;

  const current = videos[index];
  const canDelete = canUserDeleteVideo(
    currentUserId ? { uid: currentUserId } : null,
    current,
    isAdmin
  );

  const handleDownload = (url) => {
    downloadImage(url, current.filename || "video");
  };

  const handleDeleteClick = async () => {
    await onDelete(current);
    if (index >= videos.length - 1) setIndex(Math.max(0, videos.length - 2));
  };

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
              {canDelete && (
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
              )}
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
                    ? timeAgoFromTimestamp(videos[index].createdAt)
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
                {canDelete && (
                  <Button
                    colorScheme="red"
                    variant="outline"
                    onClick={handleDeleteClick}
                    size="sm"
                  >
                    Delete
                  </Button>
                )}
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

/* ----------------- Videos Page ----------------- */

/**
 * allowUpload: boolean - controls whether upload UI is shown
 */
const Videos = ({ allowUpload = true, guestMode = false }) => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const gold = "#d4af37";
  const tileBg = useColorModeValue("white", "gray.800");
  const tileShadow = useColorModeValue(
    "0 8px 30px rgba(15, 23, 42, 0.06)",
    "0 6px 20px rgba(0,0,0,0.3)"
  );
  const addCardBg = useColorModeValue("white", "gray.800");

  const { id } = useParams();
  const { user } = useAuthContext();
  const { changeEvent } = useEvent();

  // use 'videos' collection
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

  // upload modal
  const {
    isOpen: uploadOpen,
    onOpen: openUpload,
    onClose: closeUpload,
  } = useDisclosure();

  // viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const openViewerAt = (idx) => {
    setViewerIndex(idx);
    setViewerOpen(true);
    if (uploadOpen) closeUpload();
  };

  // admin detection (owner)
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

  // ---------------- SELECT / BATCH ACTIONS ----------------
  const [selected, setSelected] = useState(() => new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [zipProcessing, setZipProcessing] = useState(false);

  useEffect(() => {
    // clear invalid ids on data change
    setSelected((prev) => {
      const next = new Set(
        [...prev].filter((id) => (videos || []).some((v) => v.id === id))
      );
      return next;
    });
  }, [videos]);

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAll = () => setSelected(new Set((videos || []).map((i) => i.id)));
  const clearSelection = () => {
    setSelected(new Set());
    setSelectMode(false);
  };

  const downloadSelected = () => {
    if (selected.size === 0) return alert("No videos selected");
    for (const id of selected) {
      const vid = (videos || []).find((v) => v.id === id);
      if (vid) downloadImage(vid.url, vid.filename || vid.id);
    }
    clearSelection();
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return alert("No videos selected");
    for (const id of Array.from(selected)) {
      const vid = (videos || []).find((v) => v.id === id);
      if (!vid) continue;
      if (!canUserDeleteVideo(user, vid, isAdmin)) {
        alert("You can only delete your own uploads");
        continue;
      }
      try {
        await deleteDocument(vid.id);
      } catch (e) {
        console.error("Batch delete failed:", e);
      }
    }
    clearSelection();
  };

  const downloadSelectedAsZip = async () => {
    if (selected.size === 0) return alert("No videos selected");
    setZipProcessing(true);
    try {
      const items = (videos || [])
        .filter((v) => selected.has(v.id))
        .map((v) => ({ url: v.url, filename: v.filename || `${v.id}.mp4` }));
      await downloadUrlsAsZip(items, {
        concurrency: 3,
        zipFilename: `videos-selected-${Date.now()}.zip`,
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
    const all = videos || [];
    if (!all.length) return alert("No videos to download");
    setZipProcessing(true);
    try {
      const items = all.map((v) => ({
        url: v.url,
        filename: v.filename || `${v.id}.mp4`,
      }));
      await downloadUrlsAsZip(items, {
        concurrency: 3,
        zipFilename: `videos-all-${Date.now()}.zip`,
      });
      setSelectMode(false);
      setSelected(new Set());
    } catch (err) {
      console.error("downloadAllAsZip failed:", err);
      alert("ZIP failed: " + (err.message || err));
    } finally {
      setZipProcessing(false);
    }
  };

  // ---------------- UI ----------------
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

  // ✅ Guest-ready guard (same pattern as Gallery)
  if (guestMode && !user) {
    return (
      <Flex minH="80vh" align="center" justify="center">
        <Spinner />
        <Text ml={3}>Loading videos...</Text>
      </Flex>
    );
  }

  // Guests can see ALL videos
  const safeVideos = videos || [];

  const displayUploaderName = (v) => {
    if (v?.uploaderName && v.uploaderName !== "Guest") return v.uploaderName;
    if (v?.createdByName && v.createdByName !== "Guest") return v.createdByName;
    return "Guest";
  };

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
            onClick={() => setSelectMode((s) => !s)}
            variant={selectMode ? "solid" : "outline"}
            colorScheme={selectMode ? "purple" : undefined}
          >
            {selectMode ? "Exit select" : "Select videos"}
          </Button>

          <Menu>
            <MenuButton
              as={Button}
              size="sm"
              bgGradient="linear(to-r, #b58e0a, #d4af37)"
              color="black"
              leftIcon={<FiDownload />}
              borderRadius="full"
              px={4}
              py={2}
            >
              Actions
            </MenuButton>
            <MenuList>
              <MenuItem onClick={downloadSelected}>Download Selected</MenuItem>
              <MenuItem onClick={deleteSelected}>Delete Selected</MenuItem>
              <MenuItem
                onClick={downloadSelectedAsZip}
                isDisabled={selected.size === 0}
              >
                Download Selected (ZIP)
              </MenuItem>
              <MenuItem onClick={downloadAllAsZip}>Download All (ZIP)</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Select-mode toolbar */}
      {selectMode && (
        <Fade in={selectMode}>
          <Flex
            px={{ base: 3, md: 8 }}
            py={3}
            mb={4}
            align="center"
            justify="flex-start"
            bg="rgba(212,175,55,0.06)"
            borderRadius="xl"
            boxShadow="sm"
            flexWrap="wrap"
            gap={2}
            overflowX="auto"
            css={{
              "&::-webkit-scrollbar": { display: "none" },
              "-ms-overflow-style": "none",
              "scrollbar-width": "none",
            }}
          >
            <HStack
              spacing={2}
              flexWrap="wrap"
              align="center"
              justify="flex-start"
              w="full"
            >
              <Button
                size="sm"
                variant="solid"
                colorScheme="purple"
                onClick={selectAll}
              >
                Select All
              </Button>

              <Button
                size="sm"
                bg="#d4af37"
                color="black"
                leftIcon={<FiDownload />}
                onClick={downloadSelected}
              >
                Download Selected
              </Button>

              <Button
                size="sm"
                variant="outline"
                borderColor="red.400"
                color="red.400"
                leftIcon={<FiTrash2 />}
                onClick={deleteSelected}
              >
                Delete Selected
              </Button>

              <Button
                size="sm"
                variant="solid"
                colorScheme="yellow"
                leftIcon={<FiDownload />}
                isLoading={zipProcessing}
                onClick={downloadAllAsZip}
              >
                Download All (ZIP)
              </Button>

              <Button size="sm" variant="outline" onClick={clearSelection}>
                Clear
              </Button>
            </HStack>

            <Text
              fontSize="sm"
              color="gray.600"
              ml="auto"
              mt={{ base: 2, md: 0 }}
              whiteSpace="nowrap"
            >
              {selected.size} selected
            </Text>
          </Flex>
        </Fade>
      )}

      {/* Upload Modal — only mount if allowUpload */}
      {allowUpload && (
        <Modal isOpen={uploadOpen} onClose={closeUpload} size="lg" isCentered>
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
          <ModalContent borderRadius="2xl" p={4}>
            <ModalCloseButton />
            <ModalBody>
              <VideoUploadForm user={user} eventId={id} onClose={closeUpload} />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

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
            {/* Add card - only when uploads allowed */}
            {allowUpload && (
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
            )}

            {/* Video tiles */}
            {safeVideos.length > 0 ? (
              safeVideos.map((vid, idx) => {
                const canDelete = canUserDeleteVideo(user, vid, isAdmin);
                return (
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
                        onClick={() =>
                          selectMode ? toggleSelect(vid.id) : openViewerAt(idx)
                        }
                        cursor={selectMode ? "default" : "pointer"}
                        h="100%"
                      >
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

                      {/* checkbox */}
                      {selectMode && (
                        <Box
                          position="absolute"
                          top={3}
                          left={3}
                          zIndex={30}
                          onClick={(e) => e.stopPropagation()}
                          role="button"
                          aria-label={`Toggle select ${
                            vid.filename || "video"
                          }`}
                        >
                          <Checkbox
                            isChecked={selected.has(vid.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelect(vid.id);
                            }}
                            size="lg"
                            aria-label={`Select ${vid.filename || "video"}`}
                            bg="rgba(255,255,255,0.95)"
                            borderRadius="md"
                          />
                        </Box>
                      )}

                      {/* menu */}
                      <Box position="absolute" top={3} right={3} zIndex={3}>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={<FiMoreHorizontal />}
                            size="sm"
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <MenuList>
                            <MenuItem
                              icon={<FiDownload />}
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(vid.url, vid.filename || vid.id);
                              }}
                            >
                              Download
                            </MenuItem>

                            {canDelete && (
                              <MenuItem
                                icon={<FiTrash2 />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(vid);
                                }}
                              >
                                Delete
                              </MenuItem>
                            )}
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
                          {displayUploaderName(vid)}{" "}
                          {vid.createdAt
                            ? `• ${timeAgoFromTimestamp(vid.createdAt)}`
                            : ""}
                        </Text>
                      </Box>
                    </Box>
                  </GridItem>
                );
              })
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
        videos={safeVideos}
        startIndex={viewerIndex}
        onDelete={handleDelete}
        currentUserId={user?.uid}
        isAdmin={isAdmin}
      />
    </Box>
  );
};

export default Videos;
