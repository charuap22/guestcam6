import React from "react";
import {
  Button,
  Box,
  HStack,
  Flex,
  Heading,
  Stack,
  Text,
  Divider,
  Spinner,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaArrowUp, FaPlusCircle } from "react-icons/fa";
import { useAuthContext } from "../hooks/useAuthContext";
import { useDocument } from "../hooks/useDocument";
import { useHistory } from "react-router-dom";
import EventsList from "../components/EventsList";
import GetPackageInfo from "../components/GetPackageInfo";

const Dashboard = () => {
  const history = useHistory();
  const { user } = useAuthContext();
  const { document } = useDocument("users", user?.uid);
  const { isOpen, onToggle } = useDisclosure();

  // Responsive alignment
  const flexDirection = useBreakpointValue({ base: "column", md: "row" });
  const buttonWidth = useBreakpointValue({ base: "100%", md: "auto" });

  if (!document || !user) {
    return (
      <Flex minH="80vh" align="center" justify="center" direction="column">
        <Spinner size="xl" color="blue.500" mb={4} />
        <Text fontSize="lg" fontWeight="bold" color="gray.600">
          Loading your dashboard...
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      minH="100vh"
       
       
      pt={{ base: 24, md: 28 }}
    >
      {/* ---- Header Section ---- */}
      {/* <Box
        w="full"
        bg="white"
        rounded="2xl"
        boxShadow="lg"
        p={{ base: 4, md: 6 }}
        mb={6}
      >
        <Flex
          direction={flexDirection}
          align={{ base: "stretch", md: "center" }}
          justify="space-between"
          gap={4}
        >
          <Box>
            <Heading
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="700"
              color="gray.800"
            >
              Your Dashboard
            </Heading>
            <Text color="gray.500" fontSize="sm" mt={1}>
              Manage your events and upgrade your plan anytime.
            </Text>
          </Box>

          <HStack
            spacing={{ base: 2, md: 4 }}
            flexWrap="wrap"
            justify={{ base: "stretch", md: "flex-end" }}
            w={{ base: "100%", md: "auto" }}
          >
            <Button
              leftIcon={<FaArrowUp />}
              colorScheme="yellow"
              size="md"
              w={buttonWidth}
              onClick={() => history.push("/pricing")}
            >
              Upgrade Plan
            </Button>
            <Button
              leftIcon={<FaPlusCircle />}
              colorScheme="blue"
              size="md"
              w={buttonWidth}
              onClick={() => history.push("/create-event")}
            >
              Create Event
            </Button>
          </HStack>
        </Flex>
      </Box> */}

      {/* ---- Events Section ---- */}
      <Box
        w="full"
       mt={30}
        
        
        
      >
        <Stack spacing={4}>
          {/* <Heading
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="700"
            color="gray.800"
            textAlign={{ base: "center", md: "left" }}
          >
            Your Events
          </Heading>

          <Divider /> */}

          {/* Event List */}
          <EventsList />
        </Stack>
      </Box>
    </Flex>
  );
};

export default Dashboard;
