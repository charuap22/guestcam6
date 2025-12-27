import React, { useEffect } from "react";
import {
  Box,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
} from "@chakra-ui/react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useSwipeable } from "react-swipeable";
import { timeAgo } from "../utils/timeAgo";

import { getUploaderName } from "../utils/uploader";
  // or wherever timeAgo lives

export default function FullscreenViewer({
  isOpen,
  onClose,
  images = [],
  index,
  setIndex,
  user
}) {
  const hasImages = images.length > 0;
  const src = hasImages ? images[index]?.url : null;
const current = images[index];

  const handlers = useSwipeable({
    onSwipedLeft: () => setIndex((i) => Math.min(i + 1, images.length - 1)),
    onSwipedRight: () => setIndex((i) => Math.max(i - 1, 0)),
    trackMouse: true,
  });

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight")
        setIndex((i) => Math.min(i + 1, images.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, images.length, onClose, setIndex]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay bg="blackAlpha.900" />
      <ModalContent bg="transparent" {...handlers}>
        <IconButton
          icon={<FiX />}
          position="fixed"
          top={4}
          right={4}
          zIndex={10}
          color="white"
          bg="blackAlpha.600"
          onClick={onClose}
        />

        {index > 0 && (
          <IconButton
            icon={<FiChevronLeft />}
            position="fixed"
            left={4}
            top="50%"
            transform="translateY(-50%)"
            zIndex={10}
            color="white"
            bg="blackAlpha.600"
            onClick={() => setIndex((i) => i - 1)}
          />
        )}

        {index < images.length - 1 && (
          <IconButton
            icon={<FiChevronRight />}
            position="fixed"
            right={4}
            top="50%"
            transform="translateY(-50%)"
            zIndex={10}
            color="white"
            bg="blackAlpha.600"
            onClick={() => setIndex((i) => i + 1)}
          />
        )}

        <Box
          w="100vw"
          h="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {src && (
            <img
              src={src}
              alt=""
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                userSelect: "none",
              }}
              draggable={false}
            />
          )}
        </Box>

        {current && (
          <Box
            position="fixed"
            bottom={6}
            left="50%"
            transform="translateX(-50%)"
            bg="blackAlpha.700"
            color="white"
            px={4}
            py={1.5}
            borderRadius="full"
            fontSize="sm"
          >
            Uploaded by {getUploaderName(current, user)}
            {current.createdAt ? ` • ${timeAgo(current.createdAt)}` : ""}
          </Box>
        )}
      </ModalContent>
    </Modal>
  );
}
