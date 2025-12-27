// src/pages/Gallery.js
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";

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
  useDisclosure,
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tag,
  Center,
  Checkbox,
} from "@chakra-ui/react";

import { AddIcon } from "@chakra-ui/icons";
import { FiMoreHorizontal, FiDownload, FiTrash2, FiX } from "react-icons/fi";

import { useAuthContext } from "../hooks/useAuthContext";
import { useCollection } from "../hooks/useCollection";
import { useEvent } from "../hooks/useEvent";
import { useDocument } from "../hooks/useDocument";
import { useFirestore } from "../hooks/useFirestore";

import UniversalUploadModal from "../components/UniversalUploadModal";
import ImageCardSkeleton from "../components/ImageCardSkeleton";
import { downloadImage } from "../utils/downloads";

/* -------------------------------------------------- */
/* Utilities */
/* -------------------------------------------------- */

function timeAgoFromTimestamp(ts) {
  if (!ts) return "";
  const t = ts?.toDate ? ts.toDate().getTime() : new Date(ts).getTime();
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function canUserDeleteImage(user, img, isAdmin) {
  if (isAdmin) return true;
  if (!user || !img) return false;
  return (img.createdBy || img.userId) === user.uid;
}

/* -------------------------------------------------- */
/* Viewer */
/* -------------------------------------------------- */

const Viewer = ({ isOpen, onClose, images, index }) => {
  if (!images?.length) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg="transparent">
        <ModalBody p={0}>
          <Center h="100vh">
            <Image
              src={images[index]?.url}
              maxH="90vh"
              maxW="90vw"
              objectFit="contain"
            />
          </Center>

          <IconButton
            icon={<FiX />}
            position="fixed"
            top={4}
            right={4}
            onClick={onClose}
            bg="blackAlpha.700"
            color="white"
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

/* -------------------------------------------------- */
/* Gallery */
/* -------------------------------------------------- */

const MotionBox = motion(Box);

const Gallery = ({ allowUpload = true }) => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const { changeEvent } = useEvent();
  const { addDocument, deleteDocument } = useFirestore("gallery");

  const bg = useColorModeValue("gray.50", "gray.900");
  const tileBg = useColorModeValue("white", "gray.800");
  const tileShadow = useColorModeValue(
    "0 8px 30px rgba(0,0,0,0.08)",
    "0 6px 20px rgba(0,0,0,0.4)"
  );

  const { document: eventDoc } = useDocument("events", id);
  const { documents: images = [], isPending } = useCollection(
    "gallery",
    ["eventId", "==", id],
    ["createdAt", "desc"]
  );

  useEffect(() => {
    if (id) changeEvent(id);
  }, [id, changeEvent]);

  const isAdmin =
    user && eventDoc && Object.values(eventDoc).includes(user.uid);

  /* ---------------- Selection ---------------- */

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const toggleSelect = (imgId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(imgId) ? next.delete(imgId) : next.add(imgId);
      return next;
    });
  };

  const clearSelection = () => {
    setSelected(new Set());
    setSelectMode(false);
  };

  const deleteSelected = async () => {
    for (const id of selected) {
      const img = images.find((i) => i.id === id);
      if (!img) continue;
      if (!canUserDeleteImage(user, img, isAdmin)) continue;
      await deleteDocument(img.id);
    }
    clearSelection();
  };

  const downloadSelected = () => {
    selected.forEach((id) => {
      const img = images.find((i) => i.id === id);
      if (img) downloadImage(img.url, img.filename || img.id);
    });
    clearSelection();
  };

  /* ---------------- Viewer ---------------- */

  const [viewerIndex, setViewerIndex] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  /* ---------------- Virtualizer ---------------- */

  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: images.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 360,
    overscan: 6,
  });

  /* -------------------------------------------------- */

  return (
    <Box bg={bg} minH="100vh">
      {/* Header */}
      <Flex px={6} py={4} justify="space-between">
        <HStack>{isAdmin && <Tag colorScheme="yellow">Owner</Tag>}</HStack>

        <HStack>
          <Button size="sm" onClick={() => setSelectMode((s) => !s)}>
            {selectMode ? "Exit select" : "Select images"}
          </Button>

          <Menu>
            <MenuButton as={Button} size="sm">
              Actions
            </MenuButton>
            <MenuList>
              <MenuItem onClick={downloadSelected}>Download selected</MenuItem>
              <MenuItem onClick={deleteSelected}>Delete selected</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Virtualized Grid */}
      <Box ref={parentRef} h="calc(100vh - 120px)" overflow="auto" px={6}>
        <Box position="relative" height={`${rowVirtualizer.getTotalSize()}px`}>
          {isPending &&
            [...Array(8)].map((_, i) => <ImageCardSkeleton key={i} />)}

          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const img = images[virtualRow.index];
            if (!img) return null;

            return (
              <MotionBox
                key={img.id}
                position="absolute"
                top={0}
                left={0}
                transform={`translateY(${virtualRow.start}px)`}
                width="100%"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <Box
                  maxW="320px"
                  mb={6}
                  bg={tileBg}
                  borderRadius="24px"
                  boxShadow={tileShadow}
                  overflow="hidden"
                  cursor="pointer"
                  onClick={() =>
                    selectMode
                      ? toggleSelect(img.id)
                      : (() => {
                          setViewerIndex(virtualRow.index);
                          onOpen();
                        })()
                  }
                >
                  {selectMode && (
                    <Checkbox
                      position="absolute"
                      top={3}
                      left={3}
                      zIndex={10}
                      isChecked={selected.has(img.id)}
                    />
                  )}

                  <Image src={img.url} w="100%" />

                  <Box p={3}>
                    <Text fontSize="xs" color="gray.500">
                      {timeAgoFromTimestamp(img.createdAt)}
                    </Text>
                  </Box>

                  <Box position="absolute" top={2} right={2}>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreHorizontal />}
                        size="sm"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <MenuList>
                        <MenuItem
                          icon={<FiDownload />}
                          onClick={() =>
                            downloadImage(img.url, img.filename || "photo")
                          }
                        >
                          Download
                        </MenuItem>
                        {canUserDeleteImage(user, img, isAdmin) && (
                          <MenuItem
                            icon={<FiTrash2 />}
                            onClick={() => deleteDocument(img.id)}
                          >
                            Delete
                          </MenuItem>
                        )}
                      </MenuList>
                    </Menu>
                  </Box>
                </Box>
              </MotionBox>
            );
          })}
        </Box>
      </Box>

      {/* Add Button */}
      {allowUpload && (
        <Box position="fixed" bottom={6} right={6}>
          <Button
            leftIcon={<AddIcon />}
            onClick={onOpen}
            borderRadius="full"
            bg="#EBD9A6"
          >
            Add Photos
          </Button>
        </Box>
      )}

      <Viewer
        isOpen={isOpen}
        onClose={onClose}
        images={images}
        index={viewerIndex}
      />

      <UniversalUploadModal
        isOpen={isOpen}
        onClose={onClose}
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
          });
        }}
      />
    </Box>
  );
};

export default Gallery;
