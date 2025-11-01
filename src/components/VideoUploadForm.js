// src/components/VideoUploadForm.js
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
  Center,
  Heading,
  Divider,
  IconButton,
  useToast,
  Button,
  AspectRatio,
} from "@chakra-ui/react";
import { AddIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { ProgressBar } from "./ProgressBar"; // your existing upload helper

const gold = "#d4af37";
const MAX_FILE_SIZE = 200 * 1024 * 1024;
const allowedTypes = [
  "video/mp4",
  "video/quicktime",
  "video/x-m4v",
  "video/webm",
  "video/ogg",
];

const humanFileSize = (size) => {
  if (size === 0) return "0 B";
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${
    ["B", "KB", "MB", "GB"][i]
  }`;
};

// helper: capture a thumbnail (dataURL) from a video previewURL
async function captureThumbnailFromVideo(previewUrl, seekTo = 0.5) {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement("video");
      video.src = previewUrl;
      video.crossOrigin = "anonymous";
      // load metadata to know duration
      video.addEventListener(
        "loadedmetadata",
        () => {
          // seek to a point (fraction of duration)
          const duration = video.duration || 1;
          const time = Math.min(Math.max(seekTo * duration, 0), duration - 0.1);
          const handleSeeked = () => {
            try {
              const canvas = document.createElement("canvas");
              // set resolution reasonably small for thumbnails
              const w = Math.min(640, video.videoWidth || 640);
              const h = Math.round(
                (w * (video.videoHeight || w)) / (video.videoWidth || w)
              );
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
              // cleanup
              video.removeEventListener("seeked", handleSeeked);
              resolve(dataUrl);
            } catch (err) {
              video.removeEventListener("seeked", handleSeeked);
              resolve(null); // don't fail whole flow, just return null
            }
          };
          video.addEventListener("seeked", handleSeeked);
          // some browsers need small timeout before setting currentTime
          try {
            video.currentTime = time;
          } catch (err) {
            // fallback: try after a small delay
            setTimeout(() => (video.currentTime = time), 200);
          }
        },
        { once: true }
      );
      // safety: if video can't load, resolve null after timeout
      setTimeout(() => resolve(null), 4000);
    } catch (err) {
      resolve(null);
    }
  });
}

const VideoUploadForm = ({ user, onUploadComplete, onClose }) => {
  const hiddenFileInput = useRef(null);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]); // entries: { id, file, previewUrl, name, size, thumbnailDataUrl }
  const toast = useToast();

  useEffect(() => {
    return () => {
      files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    };
  }, [files]);

  const validateAndAdd = useCallback(async (selectedFiles) => {
    setError(null);
    const toAdd = [];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError("Only MP4, MOV, M4V, WEBM or OGG video files are allowed.");
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
      const id = `${file.name}-${file.size}-${Date.now()}`;

      // generate thumbnail (best-effort; non-blocking UI)
      // we await here so the thumbnail is ready when we render previews
      const thumbnailDataUrl = await captureThumbnailFromVideo(previewUrl, 0.2);

      toAdd.push({
        id,
        file,
        previewUrl,
        name: file.name,
        size: file.size,
        thumbnailDataUrl, // may be null if capture fails
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
      const removed = prev.find((p) => p.id === id);
      if (removed && removed.previewUrl)
        URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  // called by ProgressBar when one file upload completes
  // now we include the thumbnailDataUrl in the callback
  const onFileDone = (meta, originalFile) => {
    // find entry to pick thumbnail
    const entry = files.find((p) => p.file === originalFile);
    const thumb = entry?.thumbnailDataUrl || null;

    setFiles((prev) => {
      const remaining = prev.filter((p) => p.file !== originalFile);
      const finished = prev.find((p) => p.file === originalFile);
      if (finished && finished.previewUrl)
        URL.revokeObjectURL(finished.previewUrl);
      return remaining;
    });

    if (onUploadComplete) {
      // meta should contain uploaded video url (depends on your ProgressBar implementation)
      // we pass thumbnailDataUrl separately so caller can upload the thumbnail or save dataURL to Firestore
      onUploadComplete(meta, {
        thumbnailDataUrl: thumb,
        name: originalFile.name,
        size: originalFile.size,
      });
    }

    toast({
      title: "Video uploaded",
      description: `${meta?.name || originalFile.name} uploaded successfully.`,
      status: "success",
      duration: 2500,
      isClosable: true,
      position: "bottom-right",
    });
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md">Add videos</Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Upload videos (MP4, MOV, WEBM, OGG). Max size{" "}
            {humanFileSize(MAX_FILE_SIZE)} each.
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
                bg="linear-gradient(180deg, rgba(99,102,241,0.04), rgba(124,58,237,0.03))"
                p={3}
              >
                <AddIcon boxSize={6} color={gold} />
              </Box>
              <Text fontWeight="600">
                Drag & drop videos here or click to browse
              </Text>
              <Text fontSize="sm" color="gray.500">
                Select multiple videos at once.
              </Text>
            </VStack>
          </Box>
        </Center>

        <input
          ref={hiddenFileInput}
          type="file"
          accept="video/*"
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
                {files.length} video{files.length > 1 ? "s" : ""}
              </Text>
            </HStack>

            <Wrap spacing={4}>
              {files.map((entry) => (
                <WrapItem key={entry.id}>
                  <Box
                    w="220px"
                    borderRadius="md"
                    overflow="hidden"
                    boxShadow="sm"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Box position="relative" h="140px" bg="gray.50">
                      <AspectRatio ratio={16 / 9}>
                        <video
                          src={entry.previewUrl}
                          playsInline
                          muted
                          loop
                          autoPlay
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </AspectRatio>

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
                        {entry.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {humanFileSize(entry.size)}
                      </Text>

                      <Box mt={3}>
                        <ProgressBar
                          file={entry.file}
                          fileurl={entry.previewUrl}
                          user={user}
                          fileType="videos"
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

export default VideoUploadForm;
