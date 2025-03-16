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
  Divider
} from "@chakra-ui/react";
import GuestList from "../components/GuestList";
import { FaCrown, FaArrowUp } from "react-icons/fa";
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

  const { documents, error } = useCollection("events", [
    "adminId",
    "==",
    user.uid,
  ]);

  const { document, error2 } = useDocument("users", user.uid);
  console.log(user.uid, "users", document);
  //const planId = document.planId;
  if (!document || !user) {
    return <div className="loading">Loading...</div>;
  }
  return (
    <Flex direction="column" align="center" bg="gray.50" minH="100vh" p={6}>
      <Flex
        w="full"
        align="center"
        justify="space-between"
        p={4}
        bg="gray.100"
        rounded="lg"
      >
        <Flex align="center">
          <Icon as={FaCrown} w={8} h={8} color="yellow.500" mr={3} />
          <GetPackageInfo />
        </Flex>
        <Button
          leftIcon={<FaArrowUp />}
          colorScheme="yellow"
          variant="solid"
          onClick={() => history.push("/pricing")}
        >
          Upgrade Plan
        </Button>
      </Flex>

      <Divider my={6} />


        <Box
          rounded={"lg"}
          bg={"white"}
          boxShadow={"lg"}
          p={8}
          width="full"
          mx={"auto"}
        >
          <Stack spacing={4}>
            <Heading fontSize={"xl"} mb={2}>
              Event
            </Heading>
            <hr></hr>

            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}
            {documents && <EventsList events={documents}></EventsList>}
          </Stack>
        </Box>
      
    </Flex>
  );
};

export default Dashboard;
