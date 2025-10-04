import {
  useDisclosure,
  Button,
  Slide,
  Box,
  HStack,
  Flex,
  Spacer,
  Heading,
  Stack,
  SimpleGrid,
  Avatar,
  AvatarBadge,
  Text,
  Alert,
  AlertIcon,
  Image,
  Icon,
   
  useToast,
} from "@chakra-ui/react";
import { Link, useHistory } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useEvent } from "../hooks/useEvent";
import { useFirestore } from "../hooks/useFirestore";
import { useState } from "react";
import { useCollection } from "../hooks/useCollection"; // ✅ Import to fetch live updates
import { useAuthContext } from "../hooks/useAuthContext";

export const CircleIcon = (props) => (
  <Icon viewBox="0 0 200 200" {...props}>
    <path
      fill="currentColor"
      d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
    />
  </Icon>
);

export default function EventsList() {
  const history = useHistory();
  const { deleteDocument } = useFirestore("events");
  const { user } = useAuthContext(); // ✅ Get logged-in user
  const { documents: events, error } = useCollection("events", [
    "adminId",
    "==",
    user?.uid, // Ensure it fetches only this user's events
  ]);

  const toast = useToast();
  // ✅ Fix: Ensure events is always an array (if null, default to [])
  const safeEvents = events || [];
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );
    // ✅ Listen for real-time Firestore updates

    if (confirmDelete) {
      try {
        await deleteDocument(eventId);
        toast({
          title: "Event Deleted",
          description: "The event has been successfully deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      } catch (err) {
        console.error("Failed to delete event", err);
        toast({
          title: "Error",
          description: "Failed to delete the event.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    }
  };

  return (
    <div>
      {safeEvents.length === 0 ? (
        <Text>No events yet!</Text>
      ) : (
        safeEvents.map((event) => (
          <Stack
            key={event.id}
            style={{ background: "#f7f5f1bd", padding: "30px" }}
            align={"center"}
            spacing={{ base: 8, md: 10 }}
            py={{ base: 20, md: 28 }}
            direction={{ base: "column", md: "row" }}
            mb={"40px"}
          >
            <Stack flex={1} spacing={{ base: 5, md: 10 }}>
              <Heading
                lineHeight={1.1}
                fontWeight={600}
                fontSize={{ base: "2xl", sm: "3xl", lg: "5xl" }}
              >
                <Text
                  as={"span"}
                  position={"relative"}
                  _after={{
                    content: "''",
                    width: "full",
                    height: "30%",
                    position: "absolute",
                    bottom: 1,
                    left: 0,
                    bg: "red.400",
                    zIndex: -1,
                  }}
                >
                    {event.eventName}
                </Text>
                <br />
                <Text
                  as={"span"}
                  color={"red.400"}
                  fontSize={{ base: "md", sm: "l", lg: "xl" }}
                >
                  {event.siteStatus}
                  <CircleIcon
                    boxSize={6}
                    ml={2}
                    color={
                      event.siteStatus === "Live" ? "green.500" : "red.500"
                    }
                  />
                </Text>
                <Text
                  fontSize={{ base: "md", sm: "l", lg: "xl" }}
                  fontWeight={"bold"}
                >
                  {event.eventPageHeader}
                </Text>
              </Heading>

              <Text color={"gray.500"}>{event.welcomeMessage}</Text>
              <Stack
                spacing={{ base: 4, sm: 6 }}
                direction={{ base: "row", sm: "column", md: "row", lg: "row" }}
              >
                <Box
                  size={"lg"}
                  fontWeight={"normal"}
                  px={6}
                  py={2}
                  background={"#edf2f7"}
                >
                  Date of Event:
                  <b> {event.dateOfEvent.toDate().toDateString()}</b>
                </Box>
              </Stack>
              {/* Buttons Section */}
              <HStack spacing={4} mt={4}>
                <Link to={`/events/${event.id}`}>
                  <Button
                    rounded="full"
                    size="lg"
                    fontWeight="normal"
                    px={6}
                    colorScheme="red"
                    bg="#a78200"
                    _hover={{ bg: "#634d01" }}
                    onClick={() => history.push(`/events/${event.id}`)}
                  >
                    Get Started
                  </Button>
                </Link>

                <Button
                  key={event.id}
                  rounded={"full"}
                  size={"lg"}
                  fontWeight={"normal"}
                  px={6}
                  colorScheme={"blue"}
                  leftIcon={<FaEdit />}
                  onClick={() => history.push(`/edit-event/${event.id}`)}
                >
                  Edit Event
                </Button>

                <Button
                  leftIcon={<FaTrash />}
                  rounded={"full"}
                  size={"lg"}
                  fontWeight={"normal"}
                  px={6}
                  colorScheme={"red"}
                  onClick={() => handleDelete(event.id)}
                >
                  Delete Event
                </Button>
              </HStack>
            </Stack>
            <Flex
              flex={1}
              justify={"center"}
              align={"center"}
              position={"relative"}
              w={"full"}
            >
              <Image
                alt={"Hero Image"}
                fit={"cover"}
                align={"center"}
                w={"100%"}
                h={"100%"}
                src={event.featureImage}
              />
            </Flex>
          </Stack>
        ))
      )}
    </div>
  );
}
