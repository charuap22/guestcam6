import React from "react";
import {
  useToast,
  Button,
  Box,
  HStack,
  Flex,
  Heading,
  Stack,
  Text,
  Alert,
  AlertIcon,
  Image,
  Icon,
  Spacer,
  SimpleGrid,
  Center,
} from "@chakra-ui/react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useCollection } from "../hooks/useCollection";
import { useFirestore } from "../hooks/useFirestore";
import { useAuthContext } from "../hooks/useAuthContext";
import { useHistory } from "react-router-dom";

/* small circular indicator */
export const CircleIcon = (props) => (
  <Icon viewBox="0 0 200 200" {...props}>
    <path
      fill="currentColor"
      d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
    />
  </Icon>
);

export default function EventsList({ containerMaxW = "420px" }) {
  const history = useHistory();
  const { deleteDocument } = useFirestore("events");
  const { user } = useAuthContext();
  const { documents: events, error } = useCollection("events", [
    "adminId",
    "==",
    user?.uid,
  ]);
  const toast = useToast();
  const safeEvents = events || [];

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await deleteDocument(eventId);
      toast({
        title: "Event Deleted",
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
  };

  // use grid to place cards + add box
  return (
    <Flex
      justify="flex-start" // ✅ Align grid to left
      w="100%"
      ml={{ base: 0, md: 8 }} // 👈 Margin only on desktop view
      mr={{ base: 0, md: 8 }} // 👈 Margin only on desktop view
    >
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacing={6}
        maxW="100%"
        justifyItems="start" // ✅ Align grid items to left
        w="fit-content" // ✅ Prevents grid from expanding to full width
      >
        {/* Render existing event cards */}
        {safeEvents.length > 0 ? (
          safeEvents.map((event) => {
            const dateLabel =
              event?.dateOfEvent && event.dateOfEvent.toDate
                ? event.dateOfEvent.toDate().toDateString()
                : "Date not set";

            return (
              <Stack
                key={event.id}
                bg="#f7f5f1"
                p={{ base: 4, md: 6 }}
                align="stretch"
                spacing={4}
                borderRadius="lg"
                boxShadow="lg" // ✅ Stronger shadow
                _hover={{ boxShadow: "xl", transform: "translateY(-3px)" }} // ✅ Add hover lift effect
                transition="all 0.2s ease-in-out"
                h="full"
                w="100%" // ✅ Ensure same width alignment
              >
                {/* Header area */}
                <Box>
                  <Heading
                    as="h3"
                    fontSize={{ base: "xl", md: "2xl" }}
                    mb={1}
                    fontWeight="800"
                    color="gray.800"
                  >
                    {event.eventName}
                  </Heading>

                  <HStack spacing={3} align="center">
                    <Text color="red.500" fontWeight="700" fontSize="sm">
                      {event.siteStatus || "Draft"}
                    </Text>
                    <CircleIcon
                      boxSize={3}
                      color={
                        event.siteStatus === "Live" ? "green.400" : "red.400"
                      }
                    />
                    <Spacer />
                    <Text fontSize="sm" color="gray.600" fontWeight="600">
                      {event.eventPageHeader}
                    </Text>
                  </HStack>
                </Box>

                <Text color="gray.600" fontSize={{ base: "md", md: "lg" }}>
                  {event.welcomeMessage || "No welcome message set."}
                </Text>

                <Box
                  bg="gray.100"
                  px={3}
                  py={2}
                  display="inline-block"
                  borderRadius="md"
                  w="fit-content"
                >
                  <Text fontSize="sm" color="gray.800">
                    Date of Event:{" "}
                    <Box as="span" fontWeight="700">
                      {dateLabel}
                    </Box>
                  </Text>
                </Box>

                {/* Buttons */}
                <HStack spacing={3} align="center" flexWrap="wrap" py={3}>
                  <Button
                    onClick={() => history.push(`/admin/events/${event.id}`)}
                    rounded="full"
                    size="sm"
                    px={4}
                    fontSize="sm"
                    bg="#a78200"
                    color="white"
                    _hover={{ bg: "#634d01" }}
                  >
                    Get Started
                  </Button>
                  <Button
                    leftIcon={<FaEdit />}
                    onClick={() =>
                      history.push(`/admin/edit-event/${event.id}`)
                    }
                    rounded="full"
                    size="sm"
                    px={4}
                    fontSize="sm"
                    colorScheme="blue"
                  >
                    Edit
                  </Button>
                  <Button
                    leftIcon={<FaTrash />}
                    onClick={() => handleDelete(event.id)}
                    rounded="full"
                    size="sm"
                    px={4}
                    fontSize="sm"
                    colorScheme="red"
                  >
                    Delete
                  </Button>
                </HStack>

                {event.featureImage ? (
                  <Image
                    src={event.featureImage}
                    alt={event.eventName}
                    objectFit="cover"
                    w="100%"
                    h={{ base: "140px", md: "200px" }}
                    borderRadius="md"
                  />
                ) : null}
              </Stack>
            );
          })
        ) : (
          <Text
            textAlign="center"
            color="gray.500"
            gridColumn={{ base: "1 / -1" }}
          >
            You have no events yet.
          </Text>
        )}
  {/* ➕ Add New Event Card */}
             <Flex
               align="center"
               justify="center"
               borderRadius="lg"
               bg="gray.100"
               boxShadow="md"
               border="2px dashed #CBD5E0"
               cursor="pointer"
               transition="all 0.2s ease-in-out"
               _hover={{ bg: "gray.200", borderColor: "gray.400", boxShadow: "lg" }}
               minH={{ base: "220px", md: "100%" }}
               w="100%" // ✅ Match width with event cards
               onClick={() => history.push("/create-event")}
             >
               <Stack spacing={3} align="center">
                 <Center
                   w="60px"
                   h="60px"
                   borderRadius="full"
                   bg="#a78200"
                   color="white"
                   boxShadow="md"
                 >
                   <FaPlus size={24} />
                 </Center>
                 <Text fontWeight="600" color="gray.700">
                   Create New Event
                 </Text>
               </Stack>
             </Flex>
        
      </SimpleGrid>
    </Flex>
  );
}
