import React, { useState } from "react";
import {
  Box,
  Text,
  Button,
  VStack,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import firebase from "firebase/app";
import "firebase/storage";

export default function GuestbookUploadModal({
  isOpen,
  onClose,
  eventId,
  user,
  onUploadComplete,
}) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  /* ---------- FILE SELECT ---------- */
  const handleSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      alert("Only images and videos allowed");
      return;
    }

    setFile(f);
  };

  /* ---------- UPLOAD ---------- */
  const startUpload = async () => {
    if (!file) return;

    setUploading(true);

    const type = file.type.startsWith("video/") ? "video" : "image";

    const ref = firebase
      .storage()
      .ref(`guestbook/${eventId}/${type}s/${Date.now()}_${file.name}`);

    const task = ref.put(file);

    task.on(
      "state_changed",
      (snap) => {
        const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
        setProgress(Math.round(pct));
      },
      (err) => {
        console.error(err);
        alert("Upload failed");
        setUploading(false);
      },
      async () => {
        const url = await task.snapshot.ref.getDownloadURL();

        onUploadComplete({
          type,
          mediaUrl: url,
          content: "",
        });

        setUploading(false);
        setProgress(0);
        setFile(null);
        onClose();
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent borderRadius="xl" p={4}>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={5}>
            <Text fontWeight="600">Upload photo or video</Text>

            {/* DROP ZONE */}
            <Box
              w="100%"
              p={6}
              border="2px dashed #D1B7A1"
              borderRadius="lg"
              textAlign="center"
              cursor="pointer"
              as="label"
            >
              <input
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={handleSelect}
              />
              <Text>Drag & drop here or click to browse</Text>
              <Text fontSize="xs" color="gray.500">
                Images & videos supported
              </Text>
            </Box>

            {file && <Text fontSize="sm">Selected: {file.name}</Text>}

            {uploading && (
              <>
                <Progress value={progress} size="sm" w="100%" />
                <Text fontSize="xs">Uploading… {progress}%</Text>
              </>
            )}

            <Button
              bg="#EBD9A6"
              color="#3A2F2A"
              _hover={{ bg: "#D1B7A1" }}
              onClick={startUpload}
              isDisabled={!file || uploading}
              w="100%"
            >
              Upload
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
