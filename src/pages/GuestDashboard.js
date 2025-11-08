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
} from "@chakra-ui/react";
import { MdEvent, MdAccessTime } from "react-icons/md";
import { CircleIcon } from "../components/EventsList";
import { useAuthContext } from "../hooks/useAuthContext";
import { useUserInfo } from "../hooks/useUserInfo";

const Guest_Dashboard = () => {
  const { id } = useParams();
  const { document, error } = useDocument("events", id);
  const { user } = useAuthContext();
  const { UserInfo } = useUserInfo();
  const history = useHistory();

  // Chakra UI hooks
  const bgGradient = useColorModeValue(
    "linear(to-b, gray.50, white)",
    "linear(to-b, gray.800, gray.900)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const accentColor = useColorModeValue("yellow.500", "yellow.300");
  const textColor = useColorModeValue("gray.700", "gray.200");

  if (error) return <div className="error">{error}</div>;
  if (!document) return <div className="loading">Loading...</div>;

  const isLive = document.siteStatus === "Live";

  return (
    <Box bgGradient={bgGradient} minH="100vh" py={10}>
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
                <b>Date:</b> {document.dateOfEvent.toDate().toDateString()}
              </Text>
            </HStack>
            <HStack spacing={3} color={textColor}>
              <Icon as={MdAccessTime} />
              <Text>
                <b>Site Closes:</b>{" "}
                {document.siteCloses.toDate().toDateString()}
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

            <HStack spacing={4} pt={4}>
              <Button
                bg="gray.900"
                color="white"
                px={8}
                rounded="full"
                _hover={{ bg: "gray.700" }}
                onClick={() =>
                  history.push(`/gallery/${UserInfo.role}/${document.id}`)
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
                onClick={() => history.push(`/videos/guest/${document.id}`)}
              >
                Videos
              </Button>
              <Button
                bg={accentColor}
                color="white"
                px={8}
                rounded="full"
                _hover={{ bg: "yellow.400" }}
                onClick={() => history.push(`/guestbook/guest/${document.id}`)}
              >
                Guestbook
              </Button>
            </HStack>
          </VStack>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Guest_Dashboard;
