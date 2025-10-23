// components/ProgressBar.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Center,
  Text,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import useGalleryUpload from "../hooks/useGalleryUpload";

export const ProgressBar = ({ file, fileurl, user, fileType, onDone }) => {
  const { progress, url } = useGalleryUpload(file, user, fileType);
  const [uploadDone, setUploadDone] = useState(false);

  useEffect(() => {
    if (url) {
      setUploadDone(true);
      if (onDone) onDone({ file, url, fileType });
    }
  }, [url, onDone, file, fileType]);

  return (
    <>
      {!uploadDone && (
        <Box
          w="160px"
          h="160px"
          borderRadius="lg"
          overflow="hidden"
          position="relative"
          backgroundImage={`url(${fileurl})`}
          backgroundSize="cover"
          backgroundPosition="center"
          boxShadow="md"
          m={2}
        >
          <Center
            position="absolute"
            inset={0}
            bg="rgba(0,0,0,0.5)"
            backdropFilter="blur(2px)"
            borderRadius="lg"
          >
            <CircularProgress
              size="90px"
              value={progress}
              color="#d4af37"
              thickness="10px"
            >
              <CircularProgressLabel color="white" fontWeight="bold">
                {Math.round(progress)}%
              </CircularProgressLabel>
            </CircularProgress>
          </Center>
        </Box>
      )}

      {uploadDone && (
        <Box
          w="160px"
          h="160px"
          borderRadius="lg"
          overflow="hidden"
          position="relative"
          backgroundImage={`url(${fileurl})`}
          backgroundSize="cover"
          backgroundPosition="center"
          boxShadow="md"
          m={2}
        >
          <Center
            position="absolute"
            inset={0}
            bg="rgba(0,0,0,0.4)"
            borderRadius="lg"
          >
            <Text color="white" fontWeight="semibold">
              Uploaded ✓
            </Text>
          </Center>
        </Box>
      )}
    </>
  );
};
