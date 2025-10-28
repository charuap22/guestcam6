// src/components/ImageCard.js
import React from "react";
import {
  Box,
  Image,
  Text,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { FiDownload } from "react-icons/fi";
import { downloadImage } from "../utils/downloads"; // <- use the util

const MotionBox = motion(Box);
const gold = "#d4af37";

const ImageCard = ({ image }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const caption = image?.caption || "Untitled";
  const author = image?.createdByName || image?.createdBy || "Guest";

  // safe time handling
  let timeAgo = "";
  try {
    const date = image?.createdAt?.toDate
      ? image.createdAt.toDate()
      : new Date(image?.createdAt);
    if (!isNaN(date)) timeAgo = formatDistanceToNow(date, { addSuffix: true });
  } catch (err) {
    // ignore invalid date
  }

  const isVideo = /\.(mp4|mov|webm|m4v)$/i.test(image?.url || "");

  return (
    <>
      <MotionBox
        whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}
        transition={{ duration: 0.18 }}
        borderRadius="lg"
        overflow="hidden"
        bg="white"
        border="1px solid rgba(0,0,0,0.04)"
        onClick={onOpen}
        cursor="pointer"
      >
        <Box position="relative" overflow="hidden" h="220px">
          <Image
            src={image?.url}
            alt={caption}
            w="100%"
            h="100%"
            objectFit="cover"
          />

          {/* caption gradient at bottom — non-blocking */}
          <Box
            position="absolute"
            left={0}
            right={0}
            bottom={0}
            p={3}
            style={{ pointerEvents: "none" }}
            bg="linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)"
            color="white"
          >
            <VStack align="start" spacing={0}>
              {/* <Text
                fontSize="md"
                fontWeight="semibold"
                textShadow="0 1px 2px rgba(0,0,0,0.6)"
              >
                {caption}
              </Text> */}
              <Text fontSize="xs" color="gray.200">
                {author} {timeAgo ? `• ${timeAgo}` : ""}
              </Text>
            </VStack>
          </Box>
        </Box>
      </MotionBox>

      {/* Lightbox modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(6px)" />
        <ModalContent bg="transparent" maxW="900px">
          <ModalCloseButton color={gold} />
          <ModalBody
            p={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box maxW="90vw" maxH="80vh">
              {isVideo ? (
                <video
                  src={image?.url}
                  controls
                  style={{ width: "100%", maxHeight: "80vh", borderRadius: 8 }}
                />
              ) : (
                <Image
                  src={image?.url}
                  alt={caption}
                  objectFit="contain"
                  maxH="80vh"
                  borderRadius="md"
                />
              )}

              <Box mt={3} color="white">
                {/* <Text fontSize="lg" fontWeight="semibold" color={gold}>
                  {caption}
                </Text> */}
                <Text fontSize="sm" color="gray.300">
                  Uploaded by {author}
                </Text>
              </Box>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              bg={gold}
              color="black"
              mr={3}
              leftIcon={<FiDownload />}
              onClick={(e) => {
                e.stopPropagation();
                downloadImage(image?.url, image?.filename || image?.id);
              }}
              _hover={{ bg: "black", color: gold }}
            >
              Download
            </Button>
            <Button variant="ghost" color="white" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ImageCard;
