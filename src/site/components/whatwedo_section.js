import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  useBreakpointValue,
  Divider,
  Image,
  Tag,
} from "@chakra-ui/react";
import { ArrowRightIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";

// Lazy-loaded video component
function LazyVideo({ src, poster, title, subtitle, videoHeight = "480px" }) {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(el);
          }
        });
      },
      { root: null, rootMargin: "300px", threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isVisible]);

  return (
    <Box>
      {/* Video area */}
      <Box
        ref={ref}
        borderRadius="20px"
        overflow="hidden"
        boxShadow="0 25px 40px rgba(0,0,0,0.08)"
        w="100%"
        h={videoHeight}
        position="relative"
        transition="transform 0.3s ease, box-shadow 0.3s ease"
        _hover={{
          transform: "scale(1.015)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
        }}
      >
        {!isVisible ? (
          <Image
            src={poster}
            alt={title}
            objectFit="cover"
            w="100%"
            h="100%"
            loading="lazy"
          />
        ) : (
          <Box
            as="video"
            ref={videoRef}
            src={src}
            w="100%"
            h="100%"
            objectFit="cover"
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}
      </Box>

      {/* Caption below the video */}
      <Box mt={4}>
        <Box
          bg="white"
          px={{ base: 4, md: 6 }}
          py={4}
          borderRadius="16px"
          boxShadow="0 8px 25px rgba(2,6,23,0.06)"
        >
          <Text fontWeight={800} fontSize={{ base: "lg", md: "xl" }}>
            {title}
          </Text>
          <Text fontSize={{ base: "md", md: "lg" }} color="gray.600" mt={1}>
            {subtitle}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

export default function WhatWeDo() {
  const videos = [
    {
      src: "/videos/video1.mp4",
      poster: "/images/video1_poster.jpg",
      title: "Slideshow",
      subtitle: "Auto-play highlights of every moment",
    },
    {
      src: "/videos/video4.mp4",
      poster: "/images/video4_poster.jpg",
      title: "Guest Book",
      subtitle: "Messages, wishes & beautiful memories",
    },
    {
      src: "/videos/video3.mp4",
      poster: "/images/video3_poster.jpg",
      title: "Video Gallery",
      subtitle: "Watch every guest’s special clip",
    },
    {
      src: "/videos/video2.mp4",
      poster: "/images/video2_poster.jpg",
      title: "Photo Gallery",
      subtitle: "High-quality photo collection from guests",
    },
  ];

  const stepImages = [
    "/images/gallery-left-3.jpg",
    "/images/gallery-left-1.jpg",
    "/images/gallery-left-2.jpg",
  ];

  return (
    <Box
      as="section"
      bg="white"
      py={{ base: 12, md: 20 }}
      px={{ base: 4, md: 10 }}
    >
      <Flex
        maxW="1300px"
        mx="auto"
        gap={{ base: 8, md: 14 }}
        align="stretch"
        direction={{ base: "column", md: "row" }}
      >
        {/* LEFT SIDE (unchanged) */}
        <VStack align="flex-start" spacing={6} flex="0 0 42%">
          <Heading
            as="h2"
            fontSize={{ base: "2xl", md: "5xl" }}
            fontWeight={800}
          >
            Collect. Share. Relive.
          </Heading>
          <Text color="gray.700" fontSize={{ base: "md", md: "lg" }}>
            Create a stunning event in minutes. Share a QR code or print elegant
            templates, and let your guests capture and upload moments instantly
            — no app required.
          </Text>

          <Box
            bg="#e8dbcc"
            px={6}
            py={3}
            borderRadius="999px"
            color="#2b2b2b"
            fontWeight={700}
            width={{ base: "100%", md: "auto" }}
          >
            Where Comfort Meets Convenience
          </Box>
          <Text
            color="gray.600"
            maxW={{ base: "100%", md: "70%" }}
            fontSize={{ base: "md", md: "lg" }}
          >
            Experience<b> effortless sharing</b> and{" "}
            <b>elegant presentation </b>for your event — designed for modern
            hosts and memorable celebrations.
          </Text>
          <h3>
            {" "}
            Create <strong>separate albums for every special moment</strong> —
            the wedding ceremony, cocktail night, haldi, or reception. Each
            album can have its <strong> own QR code and sharing link</strong> ,
            so guests only see what’s relevant.{" "}
            <strong> Download every album or event gallery separately </strong>{" "}
            for easy keepsakes and sharing.
          </h3>
          <HStack spacing={3} mt={2}>
            <Tag bg="#e6c250" px={4} py={2} fontSize="sm">
              No Apps Required
            </Tag>
            <Tag bg="#e6c250" px={4} py={2} fontSize="sm">
              Easy Guest Access
            </Tag>
            <Tag bg="#e6c250" px={4} py={2} fontSize="sm">
              Private & Secure
            </Tag>
          </HStack>
          <Divider borderColor="gray.200" my={4} />
          {/* Step Visuals */}
          <VStack spacing={6} align="stretch" w="full">
            {stepImages.map((src, i) => (
              <HStack key={i} spacing={4} align="top">
                <Box
                  flex="0 0 150px"
                  borderRadius="14px"
                  overflow="hidden"
                  boxShadow="0 8px 20px rgba(0,0,0,0.08)"
                >
                  <Image
                    src={src}
                    alt={`step-${i}`}
                    objectFit="cover"
                    w="150px"
                    h="150px"
                  />
                </Box>
                <Box>
                  <Text fontWeight={800} fontSize="lg">
                    {i === 0
                      ? " Create Event"
                      : i === 1
                      ? " Share Your  QR Code or Print"
                      : " Guests Upload Photos & Videos"}
                  </Text>
                  <Text color="gray.600" fontSize="md">
                    {i === 0
                      ? "Fill a quick event form: name, date, and optional welcome message. Get your event code instantly."
                      : i === 1
                      ? "Share your QR code online or download printable cards to make it easy for guests to upload. Guests can instantly view your page and upload photos, no app or registration required."
                      : "Guests capture and share photos & videos and send messages — all collected in your event hub in real time."}
                  </Text>
                </Box>
              </HStack>
            ))}
          </VStack>
          <HStack pt={4} spacing={4}>
            <HStack pt={4} spacing={4}>
              <Button
                as={RouterLink}
                to="/howitworks"
                size="lg"
                colorScheme="blackAlpha"
                borderRadius="full"
                px={6}
                py={5}
                rightIcon={<ArrowRightIcon />}
              >
                How It Works
              </Button>

              <Button
                as={RouterLink}
                to="/pricing"
                size="lg"
                variant="ghost"
                px={6}
                py={5}
              >
                View our pricing tiers.
              </Button>
            </HStack>
          </HStack>
        </VStack>

        {/* RIGHT SIDE — Larger Mosaic Layout */}
        <Box
          flex="1"
          display="grid"
          gridTemplateColumns="1fr 1fr"
          gap={{ base: 5, md: 8 }}
          alignItems="start"
        >
          {/* Left Column */}
          <VStack spacing={{ base: 5, md: 8 }}>
            <LazyVideo
              {...videos[0]}
              videoHeight={{ base: "360px", md: "600px" }}
            />
            <LazyVideo
              {...videos[1]}
              videoHeight={{ base: "280px", md: "400px" }}
            />
          </VStack>

          {/* Right Column */}
          <VStack spacing={{ base: 5, md: 8 }}>
            <LazyVideo
              {...videos[2]}
              videoHeight={{ base: "280px", md: "400px" }}
            />
            <LazyVideo
              {...videos[3]}
              videoHeight={{ base: "360px", md: "600px" }}
            />
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
