// src/components/ImageGrid.js
import React, { useState } from "react";
import {
  Box,
  SimpleGrid,
  Flex,
  Button,
  Text,
  HStack,
  Spacer,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Stack,
  useToast,
  Alert,
  AlertIcon,
  Center,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FaDownload, FaTrash, FaFileArchive, FaCheck } from "react-icons/fa";

import ImageCard from "./ImageCard";
import ImageCardSkeleton from "./ImageCardSkeleton";
import { downloadImage, downloadFolderAsZip } from "../utils/downloads";

const gold = "#d4af37";

export default function ImageGrid({
  images = [],
  eventId,
  userId,
  userType,
  deleteDocumentsFn, // expect function from parent (Gallery)
  lastImageRef = null,
}) {
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState(null);
  const [zipProcessing, setZipProcessing] = useState(false);
  const toast = useToast();

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const clearSelection = () => {
    setSelected(new Set());
    setSelectMode(false);
  };

  const downloadSelected = () => {
    if (selected.size === 0)
      return toast({ title: "No images selected", status: "info" });
    selected.forEach((id) => {
      const img = images.find((i) => i.id === id);
      if (img) downloadImage(img.url, img.filename || img.id);
    });
    toast({ title: "Downloads started", status: "success" });
  };

  const deleteSelected = async () => {
    if (selected.size === 0)
      return toast({ title: "No images selected", status: "info" });

    if (!deleteDocumentsFn) {
      // This is the situation you reported — now parent passes deleteDocumentsFn
      return toast({ title: "Delete not available", status: "warning" });
    }

    const items = Array.from(selected);
    for (const id of items) {
      const img = images.find((i) => i.id === id);
      if (!img) continue;
      const canDelete = img.createdBy === userId || userType === "Admin";
      if (canDelete) {
        try {
          await deleteDocumentsFn(id);
        } catch (err) {
          setError(err.message || "Delete failed");
        }
      } else {
        toast({
          title: "You can only delete your own uploads",
          status: "error",
        });
      }
    }
    clearSelection();
    toast({ title: "Images deleted", status: "success" });
  };

  const downloadAllZip = async () => {
    if (!eventId) return toast({ title: "Missing event id", status: "error" });
    setZipProcessing(true);
    try {
      await downloadFolderAsZip(`gallery/${eventId}`);
      toast({ title: "Zip created", status: "success" });
    } catch (err) {
      setError(err.message || "Zip failed");
    } finally {
      setZipProcessing(false);
    }
  };

  if (!images || images.length === 0) {
    return (
      <Center py={12}>
        <Text color="gray.500">No images yet. Upload your first memory ✨</Text>
      </Center>
    );
  }

  return (
    <Box>
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Flex align="center" mb={4} wrap="wrap" gap={3}>
        <HStack spacing={3}>
          <Button
            size="sm"
            onClick={() => {
              setSelectMode((s) => !s);
              if (selectMode) setSelected(new Set());
            }}
            bg={selectMode ? "transparent" : "rgba(0,0,0,0.03)"}
            color={selectMode ? "black" : "gray.800"}
            border={selectMode ? `1px solid ${gold}` : "1px solid transparent"}
            leftIcon={<FaCheck color={selectMode ? gold : "gray.600"} />}
            borderRadius="full"
            px={4}
            py={2}
          >
            {selectMode ? "Selecting..." : "Select"}
          </Button>

          <Popover>
            <PopoverTrigger>
              <Button
                size="sm"
                bgGradient="linear(to-r, #b58e0a, #d4af37)"
                color="black"
                leftIcon={<FaDownload />}
                rightIcon={<ChevronDownIcon />}
                borderRadius="full"
                px={4}
                py={2}
              >
                Actions
              </Button>
            </PopoverTrigger>
            <PopoverContent w="260px">
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontWeight="semibold">Quick Actions</PopoverHeader>
              <PopoverBody>
                <Stack spacing={2}>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<FaDownload />}
                    justifyContent="flex-start"
                    onClick={downloadSelected}
                  >
                    Download Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<FaTrash />}
                    justifyContent="flex-start"
                    onClick={deleteSelected}
                  >
                    Delete Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<FaFileArchive />}
                    justifyContent="flex-start"
                    onClick={downloadAllZip}
                    isLoading={zipProcessing}
                  >
                    Download All (zip)
                  </Button>
                </Stack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </HStack>

        <Spacer />

        <Text fontSize="sm" color="gray.600">
          {images.length} photos
        </Text>
      </Flex>

      {/* Grid */}
      <SimpleGrid
        columns={{ base: 2, sm: 3, md: 4 }}
        spacing={{ base: 1.5, md: 4 }}
      >
        {images.map((img, i) => (
          <Box
            key={img.id}
            position="relative"
            ref={i === images.length - 1 ? lastImageRef : null}
          >
            {selectMode && (
              <Box position="absolute" top="8px" left="8px" zIndex={2}>
                <input
                  type="checkbox"
                  checked={selected.has(img.id)}
                  onChange={() => toggle(img.id)}
                  style={{ width: 18, height: 18 }}
                />
              </Box>
            )}

            <Box
              role="button"
              aria-label={img.caption || "View image"}
              tabIndex={0}
            >
              <ImageCard image={img} />
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      {/* Footer actions when select mode active */}
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
              bg={gold}
              color="black"
              onClick={downloadSelected}
            >
              <FaDownload style={{ marginRight: 6 }} />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              borderColor="red.400"
              color="red.400"
              onClick={deleteSelected}
            >
              <FaTrash style={{ marginRight: 6 }} />
              Delete
            </Button>
            <Button size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </HStack>
        </Flex>
      )}
    </Box>
  );
}
