// HorizonUI-like Dashboard (Chakra UI)
// File: HorizonUI-Chakra-Dashboard.jsx
// Description: Single-file React component for a dashboard that shows Photos, Videos, Guest Messages
// and links to open the corresponding pages. Built with Chakra UI and react-router-dom Link.
// Dependencies:
//   react, react-dom, react-router-dom, @chakra-ui/react, @chakra-ui/icons, react-icons
// How to use:
// 1. Install dependencies: npm i react-router-dom @chakra-ui/react @chakra-ui/icons react-icons
// 2. Wrap your app in <ChakraProvider> and set up react-router routes for /photos, /videos, /messages
// 3. Place this file in your components and import it into your route.

import React from "react";
import {
  Box,
  Flex,
  Grid,
  Heading,
  IconButton,
  Avatar,
  Text,
  Stack,
  Image,
  Badge,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  Divider,
  Center,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  FiMenu,
  FiImage,
  FiVideo,
  FiMessageSquare,
  FiExternalLink,
} from "react-icons/fi";

// Sample data (replace with props or fetch from Firestore/your API)
const samplePhotos = [
  {
    id: "p1",
    title: "Kids at play",
    src: "https://placeimg.com/640/480/people",
    by: "Guest A",
  },
  {
    id: "p2",
    title: "Stage performance",
    src: "https://placeimg.com/640/480/arch",
    by: "Admin",
  },
  {
    id: "p3",
    title: "Group photo",
    src: "https://placeimg.com/640/480/nature",
    by: "Guest B",
  },
];

const sampleVideos = [
  {
    id: "v1",
    title: "Recital 1",
    thumb: "https://placeimg.com/640/360/tech",
    url: "#",
  },
  {
    id: "v2",
    title: "Dance show",
    thumb: "https://placeimg.com/640/360/animals",
    url: "#",
  },
];

const sampleMessages = [
  {
    id: "m1",
    from: "Guest A",
    text: "Thank you for organizing!",
    time: "2 hrs ago",
  },
  {
    id: "m2",
    from: "Parent B",
    text: "Loved the performance. Photos please!",
    time: "1 day ago",
  },
  {
    id: "m3",
    from: "Guest C",
    text: "How can I download photos?",
    time: "3 days ago",
  },
];

export default function Guest_Dashboard() {
  const photoModal = useDisclosure();
  const videoModal = useDisclosure();
  const [activeMedia, setActiveMedia] = React.useState(null);

  function openPhoto(photo) {
    setActiveMedia(photo);
    photoModal.onOpen();
  }
  function openVideo(video) {
    setActiveMedia(video);
    videoModal.onOpen();
  }

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-r, gray.50, white)"
      p={{ base: 4, md: 8 }}
    >
      <Flex mb={6} align="center" justify="space-between">
        <HStack spacing={4}>
          <IconButton aria-label="menu" icon={<FiMenu />} />
          <Heading size="lg">GuestPov Dashboard</Heading>
          
        </HStack>

        <HStack spacing={4}>
          <RouterLink to="/photos">
            <Button leftIcon={<FiImage />} variant="ghost">
              Photos
            </Button>
          </RouterLink>
          <RouterLink to="/videos">
            <Button leftIcon={<FiVideo />} variant="ghost">
              Videos
            </Button>
          </RouterLink>
          <RouterLink to="/messages">
            <Button leftIcon={<FiMessageSquare />} colorScheme="teal">
              Messages
            </Button>
          </RouterLink>

          <Avatar name="Admin" size="sm" />
        </HStack>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
        {/* Main Column: Cards */}
        <VStack align="stretch" spacing={6}>
          {/* Photos Card */}
          <Box p={4} bg="white" rounded="lg" shadow="sm">
            <Flex justify="space-between" align="center" mb={3}>
              <HStack>
                <FiImage />
                <Heading size="md">Photos</Heading>
                <Text color="gray.500">{samplePhotos.length} items</Text>
              </HStack>
              <HStack>
                <RouterLink to="/photos">
                  <Button
                    size="sm"
                    variant="ghost"
                    rightIcon={<FiExternalLink />}
                  >
                    Open photos page
                  </Button>
                </RouterLink>
              </HStack>
            </Flex>

            <Grid
              templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
              gap={3}
            >
              {samplePhotos.map((p) => (
                <Box
                  key={p.id}
                  onClick={() => openPhoto(p)}
                  cursor="pointer"
                  rounded="md"
                  overflow="hidden"
                  borderWidth={1}
                  borderColor="gray.100"
                >
                  <Image
                    src={p.src}
                    alt={p.title}
                    objectFit="cover"
                    h="140px"
                    w="100%"
                  />
                  <Box p={2}>
                    <Text fontWeight="semibold" fontSize="sm">
                      {p.title}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      By {p.by}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Grid>
          </Box>

          {/* Videos Card */}
          <Box p={4} bg="white" rounded="lg" shadow="sm">
            <Flex justify="space-between" align="center" mb={3}>
              <HStack>
                <FiVideo />
                <Heading size="md">Videos</Heading>
                <Text color="gray.500">{sampleVideos.length} items</Text>
              </HStack>
              <RouterLink to="/videos">
                <Button
                  size="sm"
                  variant="ghost"
                  rightIcon={<FiExternalLink />}
                >
                  Open videos page
                </Button>
              </RouterLink>
            </Flex>

            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={3}
            >
              {sampleVideos.map((v) => (
                <Box
                  key={v.id}
                  rounded="md"
                  overflow="hidden"
                  borderWidth={1}
                  borderColor="gray.100"
                >
                  <Image
                    src={v.thumb}
                    alt={v.title}
                    objectFit="cover"
                    h="140px"
                    w="100%"
                    onClick={() => openVideo(v)}
                    cursor="pointer"
                  />
                  <Box p={2}>
                    <Text fontWeight="semibold" fontSize="sm">
                      {v.title}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Grid>
          </Box>

          {/* Quick Links / Actions */}
          <Box p={4} bg="white" rounded="lg" shadow="sm">
            <Heading size="sm" mb={3}>
              Quick actions
            </Heading>
            <HStack spacing={3} wrap="wrap">
              <RouterLink to="/photos">
                <Button leftIcon={<FiImage />} variant="outline">
                  Upload Photo
                </Button>
              </RouterLink>
              <RouterLink to="/videos">
                <Button leftIcon={<FiVideo />} variant="outline">
                  Upload Video
                </Button>
              </RouterLink>
              <RouterLink to="/messages">
                <Button leftIcon={<FiMessageSquare />} colorScheme="teal">
                  View Messages
                </Button>
              </RouterLink>
            </HStack>
          </Box>
        </VStack>

        {/* Sidebar Column */}
        <VStack align="stretch" spacing={6}>
          {/* Messages */}
          <Box p={4} bg="white" rounded="lg" shadow="sm">
            <Flex justify="space-between" align="center" mb={3}>
              <HStack>
                <FiMessageSquare />
                <Heading size="sm">Guest Messages</Heading>
              </HStack>
              <RouterLink to="/messages">
                <Button size="sm" variant="ghost">
                  Open
                </Button>
              </RouterLink>
            </Flex>

            <VStack align="stretch" spacing={3}>
              {sampleMessages.map((m) => (
                <Box
                  key={m.id}
                  p={2}
                  rounded="md"
                  borderWidth={1}
                  borderColor="gray.50"
                >
                  <Flex justify="space-between" align="center">
                    <HStack>
                      <Avatar name={m.from} size="sm" />
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold">
                          {m.from}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {m.text}
                        </Text>
                      </Box>
                    </HStack>
                    <Text fontSize="xs" color="gray.400">
                      {m.time}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Stats card (simple) */}
          <Box p={4} bg="white" rounded="lg" shadow="sm">
            <Heading size="sm" mb={3}>
              Overview
            </Heading>
            <Grid templateColumns="repeat(3, 1fr)" gap={3}>
              <Box p={3} bg="gray.50" rounded="md">
                <Text fontSize="sm">Photos</Text>
                <Heading size="md">{samplePhotos.length}</Heading>
              </Box>
              <Box p={3} bg="gray.50" rounded="md">
                <Text fontSize="sm">Videos</Text>
                <Heading size="md">{sampleVideos.length}</Heading>
              </Box>
              <Box p={3} bg="gray.50" rounded="md">
                <Text fontSize="sm">Messages</Text>
                <Heading size="md">{sampleMessages.length}</Heading>
              </Box>
            </Grid>
          </Box>

          <Center>
            <Text fontSize="xs" color="gray.500">
              Built with Chakra UI — customize to match Horizon styles
            </Text>
          </Center>
        </VStack>
      </Grid>

      {/* Photo Modal */}
      <Modal isOpen={photoModal.isOpen} onClose={photoModal.onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{activeMedia?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {activeMedia && (
              <Image
                src={activeMedia.src}
                alt={activeMedia.title}
                w="100%"
                rounded="md"
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={photoModal.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Video Modal */}
      <Modal isOpen={videoModal.isOpen} onClose={videoModal.onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{activeMedia?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {activeMedia && (
              <Box as="video" controls w="100%" rounded="md">
                <source src={activeMedia.url} />
                Your browser does not support the video tag.
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={videoModal.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
