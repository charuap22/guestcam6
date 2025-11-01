import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Center,
  Box,
} from "@chakra-ui/react";

const VideoModal = ({ isOpen, onClose, src }) => {
  if (!src) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered>
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg="transparent" boxShadow="none" maxW="100vw" h="100vh">
        <ModalCloseButton color="white" zIndex={10} />
        <ModalBody
          p={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Center w="100%" h="100%">
            <Box
              as="video"
              src={src}
              controls
              autoPlay
              style={{
                maxHeight: "92vh",
                maxWidth: "100%",
                borderRadius: "12px",
              }}
            />
          </Center>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default VideoModal;
