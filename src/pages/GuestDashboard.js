import React from "react";
import { useParams, useHistory } from "react-router-dom";
import { useDocument } from "../hooks/useDocument";
import {
  Box,
  Container,
  Stack,
  Text,
  Image,
  VStack,
  Button,
  Heading,
  SimpleGrid,
  HStack,
  useColorModeValue,
  Icon,
  Divider,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Center,
} from "@chakra-ui/react";
import { MdEvent, MdAccessTime } from "react-icons/md";
import { CircleIcon } from "../components/EventsList";
import { useAuthContext } from "../hooks/useAuthContext";
import { useUserInfo } from "../hooks/useUserInfo";
import { useEffect } from "react";

import { useEvent } from "../hooks/useEvent";

const Guest_Dashboard = () => {
  const { id } = useParams();
  const { document, error } = useDocument("events", id);
  const { user } = useAuthContext();
  const { UserInfo } = useUserInfo();
  const history = useHistory();


  const { changeEvent } = useEvent();

  useEffect(() => {
    if (id) {
      changeEvent(id);
    }
  }, [id, changeEvent]);

  // Chakra UI colors
  const bgGradient = useColorModeValue(
    "linear(to-b, gray.50, white)",
    "linear(to-b, gray.800, gray.900)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const accentColor = useColorModeValue("yellow.500", "yellow.300");
  const textColor = useColorModeValue("gray.700", "gray.200");

  // Loading state derived from absence of document
  const isLoaded = Boolean(document);
  const isLive = document?.siteStatus === "Live";

  if (error)
    return (
      <Center minH="50vh">
        <Text color="red.500">Error: {error}</Text>
      </Center>
    );

  // polished top-level loader for super-fast feel
  if (!isLoaded)
    return (
      <Box bgGradient={bgGradient} minH="100vh" py={20} mt={10}>
        <Container maxW="7xl">
          <HStack justify="space-between" mb={8} flexWrap="wrap">
            <HStack spacing={3} align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="28px" width="220px" />
            </HStack>

            <HStack spacing={4}>
              <Skeleton height="38px" width="100px" borderRadius="full" />
              <Skeleton height="38px" width="100px" borderRadius="full" />
              <Skeleton height="38px" width="120px" borderRadius="full" />
            </HStack>
          </HStack>

          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={10}
            alignItems="center"
          >
            {/* left image skeleton */}
            <Skeleton
              height={{ base: "300px", md: "500px" }}
              borderRadius="xl"
            />

            {/* right skeleton content */}
            <VStack
              align="flex-start"
              spacing={4}
              p={6}
              bg={cardBg}
              rounded="2xl"
              shadow="sm"
            >
              <Skeleton height="40px" width="60%" />
              <HStack spacing={3} w="100%">
                <SkeletonCircle size="8" />
                <SkeletonText noOfLines={1} width="70%" />
              </HStack>

              <HStack spacing={3} w="100%">
                <SkeletonCircle size="8" />
                <SkeletonText noOfLines={1} width="70%" />
              </HStack>

              <Divider />

              <Skeleton height="20px" width="40%" />
              <SkeletonText noOfLines={3} spacing="4" width="100%" />

              {/* BUTTON SKELETONS: stacked on mobile, row on md+ */}
              <Stack
                direction={{ base: "column", md: "row" }}
                spacing={4}
                pt={4}
                w="100%"
              >
                <Skeleton
                  height="44px"
                  width={{ base: "100%", md: "140px" }}
                  borderRadius="full"
                />
                <Skeleton
                  height="44px"
                  width={{ base: "100%", md: "140px" }}
                  borderRadius="full"
                />
                <Skeleton
                  height="44px"
                  width={{ base: "100%", md: "160px" }}
                  borderRadius="full"
                />
              </Stack>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>
    );

  // actual content when loaded
  return (
    <Box bgGradient={bgGradient} minH="100vh" py={20} mt={10}>
      <Container maxW="7xl">
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={10}
          alignItems="center"
        >
          {/* Left Image Card */}
          <Box
            bg={cardBg}
            rounded="2xl"
            overflow="hidden"
            shadow="md"
            transition="all 0.3s"
            _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
          >
            <Image
              src={document.featureImage}
              alt={document.eventName}
              objectFit="cover"
              w="100%"
              h={{ base: "300px", md: "500px" }}
            />
          </Box>

          {/* Right Event Details */}
          <VStack
            align="flex-start"
            spacing={5}
            bg={cardBg}
            p={8}
            rounded="2xl"
            shadow="md"
          >
            <Heading fontSize={{ base: "2xl", md: "4xl" }} color={textColor}>
              {document.eventName}
            </Heading>

            <HStack spacing={3} color={textColor}>
              <Icon as={MdEvent} />
              <Text>
                <b>Date:</b>{" "}
                {document.dateOfEvent?.toDate
                  ? document.dateOfEvent.toDate().toDateString()
                  : document.dateOfEvent}
              </Text>
            </HStack>

            <HStack spacing={3} color={textColor}>
              <Icon as={MdAccessTime} />
              <Text>
                <b>Site Closes:</b>{" "}
                {document.siteCloses?.toDate
                  ? document.siteCloses.toDate().toDateString()
                  : document.siteCloses}
              </Text>
            </HStack>

            <HStack spacing={3} pt={2}>
              <Text
                fontWeight="semibold"
                color={isLive ? "green.500" : "red.400"}
              >
                {document.siteStatus}
              </Text>
              <CircleIcon
                boxSize={4}
                color={isLive ? "green.500" : "red.400"}
              />
            </HStack>

            <Divider my={3} />

            <Box>
              <Text color={accentColor} fontWeight="600" fontSize="lg">
                {document.eventPageHeader}
              </Text>
              <Text mt={2} fontSize="md" color={textColor}>
                {document.welcomeMessage}
              </Text>
            </Box>

            {/* BUTTONS: vertical on mobile, horizontal on desktop */}
            <Stack
              direction={{ base: "column", md: "row" }}
              spacing={4}
              pt={4}
              w="100%"
            >
              <Button
                bg="gray.900"
                color="white"
                px={8}
                rounded="full"
                _hover={{ bg: "gray.700" }}
                w={{ base: "100%", md: "auto" }}
                onClick={() =>
                  history.push(`/admin/gallery/guest/${document.id}`)
                }
              >
                Photos
              </Button>

              <Button
                bg="gray.900"
                color="white"
                px={8}
                rounded="full"
                _hover={{ bg: "gray.700" }}
                w={{ base: "100%", md: "auto" }}
                onClick={() =>
                  history.push(`/admin/videos/guest/${document.id}`)
                }
              >
                Videos
              </Button>

              <Button
                bg={accentColor}
                color="white"
                px={8}
                rounded="full"
                _hover={{ bg: "yellow.400" }}
                w={{ base: "100%", md: "auto" }}
                onClick={() =>
                  history.push(`/admin/guestbook/guest/${document.id}`)
                }
              >
                Guestbook
              </Button>
            </Stack>
          </VStack>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Guest_Dashboard;
