// src/components/UploadForm.js
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  Wrap,
  WrapItem,
  Image,
  Center,
  Icon,
  Heading,
  Divider,
  IconButton,
  useToast,
  Button,
} from "@chakra-ui/react";
import { AddIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { ProgressBar } from "./ProgressBar";

const gold = "#d4af37";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const humanFileSize = (size) => {
  if (size === 0) return "0 B";
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${
    ["B", "KB", "MB", "GB"][i]
  }`;
};

const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const UploadForm = ({ user, eventId, onUploadComplete, onClose }) => {
  const hiddenFileInput = useRef(null);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]); // { file, previewUrl, id }
  const toast = useToast();

  useEffect(() => {
    return () => {
      files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    };
  }, [files]);

  const validateAndAdd = useCallback((selectedFiles) => {
    setError(null);
    const toAdd = [];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, JPEG, PNG, and WEBP files are allowed.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(
          `"${file.name}" is too large. Max allowed is ${humanFileSize(
            MAX_FILE_SIZE
          )}.`
        );
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      toAdd.push({
        id: `${file.name}-${file.size}-${Date.now()}`,
        file,
        previewUrl,
      });
    }

    if (toAdd.length > 0) {
      setFiles((prev) => [...prev, ...toAdd]);
    }
  }, []);

  const changeHandler = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    validateAndAdd(selected);
    e.target.value = null;
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = Array.from(e.dataTransfer.files || []);
    if (!dropped.length) return;
    validateAndAdd(dropped);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const toKeep = prev.filter((p) => p.id !== id);
      const removed = prev.find((p) => p.id === id);
      if (removed && removed.previewUrl)
        URL.revokeObjectURL(removed.previewUrl);
      return toKeep;
    });
  };

  const onFileDone = (meta, originalFile) => {
    setFiles((prev) => {
      const remaining = prev.filter((p) => p.file !== originalFile);
      const finished = prev.find((p) => p.file === originalFile);
      if (finished && finished.previewUrl)
        URL.revokeObjectURL(finished.previewUrl);
      return remaining;
    });

    if (onUploadComplete) onUploadComplete(meta);
    toast({
      title: "Photo uploaded",
      description: `${meta?.name || "Photo"} added successfully.`,
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "bottom-right",
    });
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md">Add photos</Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Upload JPG, PNG, WEBP. Max size {humanFileSize(MAX_FILE_SIZE)} each.
          </Text>
        </Box>

        <Divider />

        <Center>
          <Box
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={() => hiddenFileInput.current?.click()}
            cursor="pointer"
            px={6}
            py={8}
            borderRadius="lg"
            border="2px dashed"
            borderColor="gray.200"
            bg="transparent"
            transition="all 0.2s"
            _hover={{ bg: "gray.50", borderColor: gold }}
            width={{ base: "100%", sm: "640px" }}
          >
            <VStack spacing={3}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="12px"
                bg="linear-gradient(180deg, rgba(99,102,241,0.08), rgba(124,58,237,0.06))"
                p={3}
              >
                <AddIcon boxSize={6} color={gold} />
              </Box>
              <Text fontWeight="600">
                Drag & drop photos here or click to browse
              </Text>
              <Text fontSize="sm" color="gray.500">
                You can select multiple photos at once.
              </Text>
            </VStack>
          </Box>
        </Center>

        <input
          ref={hiddenFileInput}
          type="file"
          accept="image/*"
          multiple
          onChange={changeHandler}
          style={{ display: "none" }}
        />

        {error && (
          <Alert status="error" rounded="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {files.length > 0 && (
          <Box>
            <HStack justify="space-between" mb={3}>
              <Text fontSize="sm" fontWeight="600">
                {files.length} photo{files.length > 1 ? "s" : ""}
              </Text>
            </HStack>

            <Wrap spacing={4}>
              {files.map((entry) => (
                <WrapItem key={entry.id}>
                  <Box
                    w="180px"
                    borderRadius="md"
                    overflow="hidden"
                    boxShadow="sm"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Box position="relative" h="120px" bg="gray.50">
                      <Image
                        src={entry.previewUrl}
                        alt={entry.file.name}
                        objectFit="cover"
                        w="100%"
                        h="100%"
                      />
                      <IconButton
                        aria-label="remove file"
                        icon={<SmallCloseIcon />}
                        size="sm"
                        position="absolute"
                        top={2}
                        right={2}
                        bg="rgba(0,0,0,0.45)"
                        color="white"
                        onClick={() => removeFile(entry.id)}
                      />
                    </Box>

                    <Box p={3}>
                      <Text fontSize="sm" noOfLines={1} fontWeight="600">
                        {entry.file.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {humanFileSize(entry.file.size)}
                      </Text>

                      <Box mt={3}>
                        <ProgressBar
                          file={entry.file}
                          fileurl={entry.previewUrl}
                          user={user}
                          fileType="gallery"
                          eventId={eventId}
                          onDone={(meta) => onFileDone(meta, entry.file)}
                        />
                      </Box>
                    </Box>
                  </Box>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        )}

        <Center>
          <Button
            mt={6}
            size="lg"
            borderRadius="full"
            px={10}
            py={6}
            colorScheme="yellow"
            bg={gold}
            color="white"
            _hover={{ bg: "#e0b94d" }}
            onClick={() => onClose && onClose()}
          >
            Close
          </Button>
        </Center>
      </VStack>
    </Box>
  );
};

export default UploadForm;
