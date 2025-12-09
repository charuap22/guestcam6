// src/pages/Gallery.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useCollection } from "../hooks/useCollection";
import { useEvent } from "../hooks/useEvent";
import { useDocument } from "../hooks/useDocument";
import { useFirestore } from "../hooks/useFirestore";
import AdminNavbar from "../components/navbar/NavbarAdmin"
import {
  Box,
  Flex,
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
  Checkbox,
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

import {
  downloadImage,
  downloadUrlsAsZip,
  downloadFolderAsZip,
} from "../utils/downloads";
import AdminLayout from "../layouts/admin";

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
  if (!img) return null;
  return img.uploaderUid || img.userId || img.uploader_id || null;
}

function canUserDeleteImage(user, img, isAdmin = false) {
  if (!img) return false;
  if (isAdmin) return true;
  if (!user) return false;
  const uploaderId = getUploaderUid(img);
  return uploaderId && uploaderId === user.uid;
}

/* ------------------ Viewer Modal ------------------ */
const Viewer = ({
  isOpen,
  onClose,
  images,
  startIndex,
  onDelete,
  currentUserId,
  isAdmin,
}) => {
  const [index, setIndex] = useState(startIndex || 0);

  useEffect(() => {
    setIndex(startIndex || 0);
  }, [startIndex, isOpen]);

  if (!images || images.length === 0) return null;

  const currentImage = images[index];
  const canDelete = canUserDeleteImage(
    currentUserId ? { uid: currentUserId } : null,
    currentImage,
    isAdmin
  );

  const handleDownload = (url) => {
    downloadImage(url, currentImage.filename || "photo");
  };

  const handleDeleteClick = async () => {
    await onDelete(currentImage);
    if (index >= images.length - 1) setIndex(Math.max(0, images.length - 2));
  };
  
  return (
 
      

    <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg="transparent" boxShadow="none">
        <ModalBody p={0} display="flex" flexDirection="column" h="100vh">
          {/* Top bar */}
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
                  onClick={() => handleDownload(currentImage.url)}
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

          {/* Image */}
          <Center flex="1">
            <Fade in={isOpen} key={currentImage.url}>
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
                  onClick={() =>
                    setIndex((i) => (i - 1 + images.length) % images.length)
                  }
                  bg="rgba(0,0,0,0.35)"
                  color="white"
                  size="sm"
                />
                <Image
                  src={currentImage.url}
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
                  onClick={() => setIndex((i) => (i + 1) % images.length)}
                  bg="rgba(0,0,0,0.35)"
                  color="white"
                  size="sm"
                />
              </Box>
            </Fade>
          </Center>

          {/* Bottom bar */}
          <Box
            px={{ base: 3, md: 8 }}
            py={3}
            bg="linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)"
            color="white"
          >
            <Flex align="center" justify="space-between">
              <Box>
                <Text fontWeight="600">{currentImage.filename || "Photo"}</Text>
                <Text fontSize="xs" color="whiteAlpha.700">
                  {currentImage.createdAt
                    ? timeAgoFromTimestamp(currentImage.createdAt)
                    : ""}
                </Text>
              </Box>

              <HStack spacing={2}>
                <Button
                  variant="ghost"
                  color="white"
                  onClick={() => handleDownload(currentImage.url)}
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

/* ------------------ Gallery Page ------------------ */

const Gallery = ({ guestMode = false, allowUpload = true }) => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const tileBg = useColorModeValue("white", "gray.800");
  const tileShadow = useColorModeValue(
    "0 8px 30px rgba(15, 23, 42, 0.06)",
    "0 6px 20px rgba(0,0,0,0.3)"
  );

  const { id } = useParams();

  const { user } = useAuthContext();
  const { changeEvent } = useEvent();
  const { deleteDocument } = useFirestore("gallery");

  const {
    documents: images,
    error,
    isPending,
  } = useCollection("gallery", ["eventId", "==", id], ["createdAt", "desc"]);

  const { document: eventDoc, error: eventError } = useDocument("events", id);

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
      // Use folder-based zip if you prefer:
      // await downloadFolderAsZip(`gallery/${id}`);
      // Or build from urls:
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
        <Spinner size="xl" color="#d4af37" />
        <Text ml={3}>Loading photos...</Text>
      </Flex>
    );
  }

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
     
       <AdminLayout brandText="Photos">
      <AdminNavbar brandText={pageTitle} />
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
              {selectMode ? "Exit select" : "Select images"}
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
                <MenuItem onClick={downloadSelected}>
                  Download Selected
                </MenuItem>
                <MenuItem onClick={deleteSelected}>Delete Selected</MenuItem>
                <MenuItem
                  onClick={downloadSelectedAsZip}
                  isDisabled={selected.size === 0}
                >
                  Download Selected (ZIP)
                </MenuItem>
                <MenuItem onClick={downloadAllAsZip}>
                  Download All (ZIP)
                </MenuItem>
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

        {/* Upload Modal */}
        {allowUpload && (
          <Modal isOpen={uploadOpen} onClose={closeUpload} size="lg" isCentered>
            <ModalOverlay bg="blackAlpha.600" />
            <ModalContent borderRadius="2xl" p={4}>
              <ModalCloseButton />
              <ModalBody>
                <UploadForm user={user} eventId={id} onClose={closeUpload} />
              </ModalBody>
            </ModalContent>
          </Modal>
        )}

        {/* Gallery Grid */}
        <Box
          px={{ base: 3, md: 8 }}
          py={{ base: 4, md: 10 }}
          mx="auto"
          w="100%"
        >
          {isPending ? (
            <Flex wrap="wrap" justify="center" gap={{ base: 3, md: 6 }}>
              {[...Array(6)].map((_, i) => (
                <ImageCardSkeleton key={i} />
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
              {/* Add card */}
              {allowUpload && (
                <GridItem>
                  <Box
                    role="button"
                    onClick={openUpload}
                    cursor="pointer"
                    borderRadius="24px"
                    bg={tileBg}
                    boxShadow={tileShadow}
                    h={{ base: "160px", md: "220px" }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                  >
                    <AddIcon boxSize={6} color="#6b46ff" />
                    <Text fontWeight="600" mt={2}>
                      Add Photos
                    </Text>
                  </Box>
                </GridItem>
              )}

              {safeImages.map((img, idx) => {
                const canDelete = canUserDeleteImage(user, img, isAdmin);

                return (
                  <GridItem key={img.id}>
                    <Box
                      borderRadius="24px"
                      overflow="hidden"
                      bg={tileBg}
                      boxShadow={tileShadow}
                      position="relative"
                      cursor={selectMode ? "default" : "pointer"}
                      h={{ base: "160px", md: "220px" }}
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
                          role="button"
                          aria-label={`Toggle select ${
                            img.filename || "photo"
                          }`}
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

                      <Image
                        src={img.url}
                        alt={img.filename || "photo"}
                        objectFit="cover"
                        w="100%"
                        h="100%"
                      />

                      <Box position="absolute" top={2} right={2} zIndex={15}>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreHorizontal />}
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <MenuList>
                            <MenuItem
                              icon={<FiDownload />}
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(img.url, img.filename || "photo");
                              }}
                            >
                              Download
                            </MenuItem>

                            {canDelete && (
                              <MenuItem
                                icon={<FiTrash2 />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(img);
                                }}
                              >
                                Delete
                              </MenuItem>
                            )}
                          </MenuList>
                        </Menu>
                      </Box>

                      <Box
                        position="absolute"
                        bottom={3}
                        left={3}
                        bg="rgba(0,0,0,0.45)"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        <Text fontSize="xs" color="gray.200">
                          {displayUploaderName(img)}{" "}
                          {img.createdAt
                            ? `• ${timeAgoFromTimestamp(img.createdAt)}`
                            : ""}
                        </Text>
                      </Box>
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
          onDelete={handleDelete}
          currentUserId={user?.uid}
          isAdmin={isAdmin}
        />
      </Box>
      
    </AdminLayout>
  );
};

export default Gallery;
