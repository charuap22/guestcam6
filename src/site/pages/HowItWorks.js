// src/site/pages/HowItWorks.js
import React, { useState } from "react";
import {
  Box,
  Flex,
  Image,
  Heading,
  Text,
  Button,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  chakra,
} from "@chakra-ui/react";
import Footer from "../components/footer/Footer";
import { SearchIcon } from "@chakra-ui/icons";
import Header from "../components/header/Header";
import bannerBg from "../images/party-crowd-background.jpg";

// Retina-ready images
import img1 from "../images/howitworks/1.jpg";
import img1x2 from "../images/howitworks/1@2x.jpg";
import img2 from "../images/howitworks/2.jpg";
import img2x2 from "../images/howitworks/2@2x.jpg";
import img3 from "../images/howitworks/3.jpg";
import img3x2 from "../images/howitworks/3@2x.jpg";

const steps = [
  {
    title: "Create Your Event",
    desc: "Design your event page in minutes — add a title, date, and a warm welcome message. Perfect for setting the vibe of your celebration!",
    img: img1,
    img2x: img1x2,
  },
  {
    title: "Share Your Invite",
    desc: "Send your private link or QR code — guests can instantly view your page and upload photos, no app or registration required.",
    img: img2,
    img2x: img2x2,
    reverse: true,
  },
  {
    title: "Relive Every Moment",
    desc: "Browse and download all photos your guests share. Every laugh, every dance, every moment — saved beautifully in one place.",
    img: img3,
    img2x: img3x2,
  },
];

const HowItWorks = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSrcSet, setSelectedSrcSet] = useState(null);

  const openModal = (img, img2x) => {
    setSelectedImage(img);
    setSelectedSrcSet(`${img} 1x, ${img2x} 2x`);
    setIsOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setSelectedSrcSet(null);
    setIsOpen(false);
  };

  return (
    <>
      <Header
        title="How It Works"
        subtitle="Get a private QR code that instantly saves every photo and video to your live event gallery.
No app, no hassle.
Perfect for photos, videos, guestbook, and slideshow."
        headerImage={bannerBg}
      />

      {/* HERO SECTION */}
      <Box
        bgGradient="linear(to-b, #160717, #2a0845)"
        color="white"
        textAlign="center"
        py={{ base: 10, md: 20 }}
      >
        <Box maxW="1100px" mx="auto" px={4}>
          <Heading
            as="h2"
            fontSize={{ base: "xl", md: "3xl" }}
            letterSpacing="wide"
            opacity={0.9}
            color="#d0d0d0ff"
          >
            Event Photo Sharing Made Easy
          </Heading>
          <Heading
            as="h1"
            fontSize={{ base: "3xl", md: "5xl" }}
            mt={4}
            lineHeight={1.1}
            color="#fff"
          >
            Setup is a breeze, and{" "}
            <chakra.span color="#f6c73b" fontWeight="bold">
              sharing
            </chakra.span>{" "}
            is even{" "}
            <chakra.span color="#f6c73b" fontWeight="bold">
              easier
            </chakra.span>{" "}
          </Heading>
        </Box>
      </Box>

      {/* STEPS SECTION */}
      <Box bg="gray.50" py={{ base: 12, md: 20 }}>
        <Box maxW="1200px" mx="auto" px={4}>
          <Heading
            textAlign="center"
            mb={12}
            color="#2a0845"
            fontWeight="bold"
            letterSpacing="wide"
          >
            How It Works
          </Heading>

          {steps.map((step, i) => (
            <Flex
              key={i}
              direction={{
                base: "column",
                md: step.reverse ? "row-reverse" : "row",
              }}
              align="center"
              gap={12}
              mb={20}
            >
              {/* IMAGE WITH MAGNIFY ICON */}
              <Box
                position="relative"
                flex={{ base: "1", md: "0 0 45%" }}
                cursor="zoom-in"
                onClick={() => openModal(step.img, step.img2x)}
                role="group"
              >
                <Image
                  src={step.img}
                  srcSet={`${step.img} 1x, ${step.img2x} 2x`}
                  alt={step.title}
                  borderRadius="2xl"
                  boxShadow="2xl"
                  objectFit="cover"
                  w="100%"
                  h={{ base: "250px", md: "400px" }}
                  transition="transform 0.35s ease"
                  _groupHover={{
                    transform: "scale(1.03)",
                    filter: "brightness(1.08) contrast(1.1)",
                  }}
                  loading="eager"
                />
                <IconButton
                  icon={<SearchIcon />}
                  aria-label="Zoom"
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  colorScheme="yellow"
                  variant="solid"
                  borderRadius="full"
                  opacity="0"
                  _groupHover={{ opacity: 1 }}
                  transition="opacity 0.3s ease"
                  size="lg"
                  boxShadow="lg"
                />
              </Box>

              {/* STEP TEXT */}
              <Box flex="1">
                <Box
                  bg="white"
                  p={{ base: 6, md: 10 }}
                  borderRadius="2xl"
                  boxShadow="md"
                  _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                  transition="all 0.25s ease"
                >
                  <Text
                    color="#f6c73b"
                    fontWeight="bold"
                    letterSpacing="wide"
                    fontSize="sm"
                    mb={2}
                  >
                    STEP {i + 1}
                  </Text>
                  <Heading size="lg" color="#2a0845">
                    {step.title}
                  </Heading>
                  <Text
                    mt={4}
                    color="gray.600"
                    fontSize={{ base: "md", md: "lg" }}
                    lineHeight="taller"
                  >
                    {step.desc}
                  </Text>
                </Box>
              </Box>
            </Flex>
          ))}
        </Box>
      </Box>

      {/* MODAL - IMAGE PREVIEW */}
      <Modal isOpen={isOpen} onClose={closeModal} isCentered size="6xl">
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(6px)" />
        <ModalContent
          bg="rgba(255,255,255,0.04)"
          borderRadius="2xl"
          boxShadow="dark-lg"
          overflow="hidden"
        >
          <ModalCloseButton color="white" top={3} right={3} />
          <ModalBody
            display="flex"
            justifyContent="center"
            alignItems="center"
            p={4}
          >
            {selectedImage && (
              <Image
                src={selectedImage}
                srcSet={selectedSrcSet}
                alt="Preview"
                borderRadius="lg"
                maxW={{ base: "95vw", md: "90vw" }}
                maxH={{ base: "85vh", md: "90vh" }}
                objectFit="contain"
                boxShadow="2xl"
                transition="transform 0.4s ease"
                _hover={{ transform: "scale(1.02)" }}
                loading="eager"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Footer></Footer>
    </>
  );
};

export default HowItWorks;
