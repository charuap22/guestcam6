import React, { useState, useRef } from "react";
import {
  Box,
  Text,
  Button,
  Progress,
  Image,
  SimpleGrid,
  AspectRatio,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import firebase from "firebase/app";
import "firebase/storage";

export default function UniversalUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
  eventId,
  user,
  accept = "image/*,video/*",
}) {
  const inputRef = useRef();
  const [files, setFiles] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const uploadTasks = useRef({});

  /* ---------- FILE SELECT ---------- */
  const handleSelect = (e) => {
    const selected = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${file.name}-${Date.now()}`,
    }));
    setFiles((prev) => [...prev, ...selected]);
  };

  /* ---------- UPLOAD ---------- */
  const startUpload = async () => {
    files.forEach(({ file, id }) => {
      const type = file.type.startsWith("video") ? "video" : "image";
      const path = `guestbook/${eventId}/${type}s/${Date.now()}-${file.name}`;
      const ref = firebase.storage().ref(path);

      const task = ref.put(file);
      uploadTasks.current[id] = task;

      task.on(
        "state_changed",
        (snap) => {
          const percent = Math.round(
            (snap.bytesTransferred / snap.totalBytes) * 100
          );
          setProgressMap((p) => ({ ...p, [id]: percent }));
        },
        console.error,
        async () => {
          const url = await ref.getDownloadURL();
          await onUploadComplete({
            type,
            mediaUrl: url,
          });

          setFiles((prev) => prev.filter((f) => f.id !== id));
        }
      );
    });
  };

  /* ---------- CANCEL ---------- */
  const cancelUpload = (id) => {
    uploadTasks.current[id]?.cancel();
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent borderRadius="xl" p={4}>
        <ModalCloseButton />
        <ModalBody>
          <Text fontWeight="600" mb={3}>
            Upload photos or videos
          </Text>

          <Box
            border="2px dashed #EBD9A6"
            borderRadius="xl"
            p={6}
            textAlign="center"
            cursor="pointer"
            onClick={() => inputRef.current.click()}
          >
            <AddIcon mb={2} />
            <Text fontSize="sm">Drag & drop or click to browse</Text>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple
              hidden
              onChange={handleSelect}
            />
          </Box>

          {/* PREVIEWS */}
          <SimpleGrid columns={3} spacing={3} mt={4}>
            {files.map((f) => (
              <Box key={f.id} position="relative">
                {f.file.type.startsWith("video") ? (
                  <AspectRatio ratio={1}>
                    <video src={f.preview} />
                  </AspectRatio>
                ) : (
                  <Image src={f.preview} borderRadius="md" />
                )}

                <IconButton
                  icon={<CloseIcon />}
                  size="xs"
                  position="absolute"
                  top="4px"
                  right="4px"
                  onClick={() => cancelUpload(f.id)}
                />

                {progressMap[f.id] != null && (
                  <Progress
                    value={progressMap[f.id]}
                    size="xs"
                    mt={1}
                    colorScheme="yellow"
                  />
                )}
              </Box>
            ))}
          </SimpleGrid>

          <Button
            mt={5}
            w="100%"
            bg="#EBD9A6"
            _hover={{ bg: "#D1B7A1" }}
            onClick={startUpload}
            isDisabled={!files.length}
          >
            Upload
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
