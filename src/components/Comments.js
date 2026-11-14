import React, { useState } from "react";
import {
  Box,
  Avatar,
  Text,
  VStack,
  HStack,
  IconButton,
  SimpleGrid,
  useColorModeValue,
  Center,
} from "@chakra-ui/react";
import { FaTrash, FaPlay } from "react-icons/fa";
import VideoModal from "./VideoModal";

const CommentCard = ({ c, align = "left", onPlay, onDelete, isOwn }) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const avatarPos = align === "left" ? { ml: -6, mr: 4 } : { mr: -6, ml: 4 };

  return (
    <Box
      display="flex"
      alignItems="flex-start"
      justifyContent={align === "left" ? "flex-start" : "flex-end"}
    >
      <Box
        maxW="720px"
        w="100%"
        borderRadius="lg"
        bg={cardBg}
        boxShadow="md"
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 5 }}
        position="relative"
      >
        <VStack align="start" spacing={2}>
          <HStack justify="space-between" w="100%">
            <Text fontWeight="700" fontSize="md">
              {c.displayName || "Guest"}
            </Text>

            <HStack spacing={2}>
              <Text fontSize="xs" color="gray.500">
                {c.createdAt
                  ? (() => {
                      const ms = c.createdAt?.toDate
                        ? c.createdAt.toDate().getTime()
                        : new Date(c.createdAt).getTime();
                      const s = Math.floor((Date.now() - ms) / 1000);
                      if (s < 60) return "just now";
                      if (s < 3600) return `${Math.floor(s / 60)}m ago`;
                      if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
                      return `${Math.floor(s / 86400)}d ago`;
                    })()
                  : ""}
              </Text>
              {isOwn && (
                <IconButton
                  size="xs"
                  icon={<FaTrash />}
                  aria-label="Delete"
                  variant="ghost"
                  onClick={() => onDelete && onDelete(c)}
                />
              )}
            </HStack>
          </HStack>

          {/* text or video */}
          {c.type === "video" && c.videoUrl ? (
            <Box
              w="100%"
              borderRadius="md"
              overflow="hidden"
              position="relative"
              cursor="pointer"
              onClick={() => onPlay && onPlay(c.videoUrl)}
            >
              <Box
                as="img"
                src={c.thumbnailUrl || ""}
                alt="Video thumbnail"
                w="100%"
                h={{ base: "200px", md: "260px" }}
                objectFit="cover"
              />
              <Center
                position="absolute"
                inset={0}
                bg="rgba(0,0,0,0.4)"
                _hover={{ bg: "rgba(0,0,0,0.6)" }}
              >
                <IconButton
                  icon={<FaPlay />}
                  aria-label="Play video"
                  size="lg"
                  borderRadius="full"
                  bg="whiteAlpha.900"
                  color="black"
                  boxShadow="md"
                />
              </Center>
            </Box>
          ) : (
            <Text fontSize="md" color="gray.700" whiteSpace="pre-wrap">
              {c.content}
            </Text>
          )}
        </VStack>
      </Box>

      {/* avatar circle */}
      <Box
        position="relative"
        {...avatarPos}
        zIndex={2}
        width={{ base: "64px", md: "72px" }}
        height={{ base: "64px", md: "72px" }}
        borderRadius="full"
        overflow="hidden"
        boxShadow="md"
        bg="gray.100"
      >
        <Avatar
          src={c.photoURL || ""}
          name={c.displayName || "Guest"}
          size="md"
        />
      </Box>
    </Box>
  );
};

const Comments = ({
  comments = [],
  userId,
  userType,
  eventId,
  onDeleteComment,
}) => {
  const [videoSrc, setVideoSrc] = useState(null);
  const [isOpen, setOpen] = useState(false);

  const handlePlay = (src) => {
    setVideoSrc(src);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setVideoSrc(null);
  };

  return (
    <>
      <SimpleGrid columns={1} spacing={6} w="100%" maxW="840px" mx="auto">
        {comments.map((c, idx) => {
          const align = idx % 2 === 0 ? "left" : "right";
          const isOwn = c.userId && userId && c.userId === userId;
          return (
            <CommentCard
              key={c.id || idx}
              c={c}
              align={align}
              onPlay={handlePlay}
              onDelete={onDeleteComment}
              isOwn={isOwn}
            />
          );
        })}
      </SimpleGrid>

      <VideoModal isOpen={isOpen} onClose={handleClose} src={videoSrc} />
    </>
  );
};

export default Comments;
