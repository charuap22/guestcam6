import React from "react";
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
  Icon,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import GuestList from "../components/GuestList";
import { FaCrown, FaArrowUp, FaPlusCircle } from "react-icons/fa";
import { useCollection } from "../hooks/useCollection";

import EventsList from "../components/EventsList";
import GetPackageInfo from "../components/GetPackageInfo";

import { useAuthContext } from "../hooks/useAuthContext";
import { useDocument } from "../hooks/useDocument";

import { useHistory } from "react-router-dom";

const Dashboard = () => {
  let history = useHistory();
  const { isOpen, onToggle } = useDisclosure();

  const { user } = useAuthContext();

 

  const { document, error2 } = useDocument("users", user.uid);
  console.log(user.uid, "users", document);
  //const planId = document.planId;

  if (!document || !user) {
    return (
      <Flex minH="80vh" align="center" justify="center">
        <Spinner size="xl" color="blue.500" />
        <Text ml={3} fontSize="lg" fontWeight="bold" color="gray.600">
          Loading your dashboard...
        </Text>
      </Flex>
    );
  }
  return (
    <Flex direction="column" align="center" bg="gray.50" minH="100vh" p={6}>
      {/* Plan Info & Upgrade Section */}
      <Flex
        w="full"
        align="center"
        justify="space-between"
        px={3} // Reduced padding
        bg="white"
        rounded="lg"
        boxShadow="lg"
      >
        <GetPackageInfo />
        <HStack spacing={2} flexWrap="wrap">
          <Button
            leftIcon={<FaArrowUp />}
            colorScheme="yellow"
            variant="solid"
            size="md"
            px={3} // Reduced padding
            py={3}
            onClick={() => history.push("/pricing")}
          >
            Upgrade Plan
          </Button>
          <Button
            colorScheme="blue"
            variant="solid"
            size="md"
            px={3} // Reduced padding
            py={3}
            onClick={() => history.push("/create-event")}
          >
            + Create Event
          </Button>
        </HStack>
      </Flex>
      <Divider my={6} />

      <Box rounded="lg" bg="white" boxShadow="lg" p={8} width="full">
        <Stack spacing={4}>
          {/* <Heading fontSize={"xl"} mb={2}>
            Event
          </Heading>
          <hr></hr> */}

         
          <EventsList></EventsList> 
        </Stack>
      </Box>
    </Flex>
  );
};

export default Dashboard;
