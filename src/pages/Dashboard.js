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
  VStack,
} from "@chakra-ui/react";
import GuestList from "../components/GuestList";

import { useCollection } from "../hooks/useCollection";

import EventsList from "../components/EventsList";
import GetPackageInfo from "../components/GetPackageInfo";

import { useAuthContext } from "../hooks/useAuthContext";
import { useDocument } from "../hooks/useDocument";
 
import { useHistory } from "react-router-dom";
import { wrap } from "framer-motion";
const Dashboard = () => {
  const { isOpen, onToggle } = useDisclosure();
 
  const { user } = useAuthContext();
  let history = useHistory();

  const { documents, error } = useCollection("events", [
    "adminId",
    "==",
    user.uid,
  ]);

  const { document, error2 } = useDocument("users", user.uid);
  console.log(user.uid, "users", document);
  //const planId = document.planId;
  if (!document || !user ) {
    return <div className="loading">Loading...</div>;
  }
  return (
    <>
      {/* <Button onClick={onToggle}>Show Guests</Button> */}
      <Slide direction="right" in={isOpen} style={{ zIndex: 10 }}>
        <Box
          p="40px"
          color="gray"
          mt="4"
          bg="white"
          rounded="md"
          shadow="md"
          width="400px"
          position="absolute"
          right="0"
          top="100px"
          mb="100px"
          height="100vh"
        >
          <Flex mb="20px">
            <Heading as="h5" size="sm" pt="10px">
              Guests List
            </Heading>
            <Spacer />
            <Button onClick={onToggle}>Close</Button>
          </Flex>

          <hr></hr>
          <GuestList></GuestList>
        </Box>
      </Slide>
      <Flex align={"center"} justify={"center"} bg={"gray.50"}>
        <Stack spacing={8} mx={"auto"} py={6} px={0} width={"100%"}>
          <Stack align={"center"}>
            <Box
              w="95%"
              bg={"white"}
              boxShadow={"2xl"}
              rounded={"lg"}
              px={6}
              paddingTop={6}
              paddingBottom={3}
              textAlign={"left"}
            >
              <SimpleGrid
                columns={{ sm: 1, md: 3 }}
                spacing={{ sm: 0, md: 10 }}
                verticalAlign={"center"}
              >
               
                  <Heading
                    fontSize={"3xl"}
                    color={"yellow.500"}
                    fontFamily={"body"}
                    paddingTop={"5px"}
                  >
                    Package
                  </Heading>
                

                <GetPackageInfo></GetPackageInfo>
                <Button
                  rounded={"full"}
                  size={"lg"}
                  fontWeight={"normal"}
                  px={6}
                  colorScheme={"red"}
                  bg={"#a78200"}
                  _hover={{ bg: "#634d01" }}
                  onClick={() => {
                    history.push(`/pricing`);
                  }}
                >
                  Upgrade Package
                </Button>
                
              </SimpleGrid>
            </Box>
          </Stack>
          <Box
            rounded={"lg"}
            bg={"white"}
            boxShadow={"lg"}
            p={6}
            width="95%"
            mx={"auto"}
          >
            <Stack spacing={4}>
              <Heading fontSize={"xl"} mb={2}>
                Events
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
        </Stack>
      </Flex>
    </>
  );
};

export default Dashboard;
