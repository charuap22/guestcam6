// src/components/UploadForm.js
import React, { useRef, useState } from "react";
import {
  Box,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Wrap,
  WrapItem,
  Progress,
  Image,
  Center,
  Button,
  Icon,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { ProgressBar } from "./ProgressBar";

const gold = "#d4af37";

const UploadForm = ({ user, onUploadComplete }) => {
  const hiddenFileInput = useRef(null);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const types = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "video/mp4",
    "video/quicktime",
  ];

  const changeHandler = (e) => {
    setError(null);
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const invalid = selected.find((f) => !types.includes(f.type));
    if (invalid) {
      setError("Unsupported file type. Use JPG/PNG or MP4/MOV.");
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = null;
  };

  // called by ProgressBar (pass original file)
  const onFileDone = (meta, originalFile) => {
    setFiles((prev) => prev.filter((f) => f !== originalFile));
    if (onUploadComplete) onUploadComplete(meta);
  };

  return (
    <Box>
      <VStack spacing={4}>
        {/* Compact click area (no big header button here) */}
        <Center>
          <Button
            leftIcon={<Icon as={AddIcon} color={gold} />}
            variant="ghost"
            onClick={() => hiddenFileInput.current?.click()}
            border="1px dashed rgba(0,0,0,0.08)"
            px={6}
            py={4}
            borderRadius="lg"
            _hover={{ bg: "gray.50" }}
          >
            Select photos or videos
          </Button>
        </Center>

        <input
          ref={hiddenFileInput}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={changeHandler}
          style={{ display: "none" }}
        />

        {error && (
          <Alert status="error" rounded="md" width="full">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* small previews + progress */}
        {files.length > 0 && (
          <Wrap spacing={4} justify="center" w="full">
            {files.map((file, i) => (
              <WrapItem key={`${file.name}-${file.size}-${i}`}>
                <Box
                  w="160px"
                  borderRadius="md"
                  overflow="hidden"
                  boxShadow="sm"
                  bg="white"
                >
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    objectFit="cover"
                    h="100px"
                    w="160px"
                  />
                  <Box p={2}>
                    <Text fontSize="sm" noOfLines={1}>
                      {file.name}
                    </Text>
                    <ProgressBar
                      file={file}
                      fileurl={URL.createObjectURL(file)}
                      user={user}
                      fileType={
                        file.type.includes("image") ? "gallery" : "videos"
                      }
                      onDone={(meta) => onFileDone(meta, file)}
                    />
                  </Box>
                </Box>
              </WrapItem>
            ))}
          </Wrap>
        )}
      </VStack>
    </Box>
  );
};

export default UploadForm;
