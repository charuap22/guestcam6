import React from "react";
import {
  Box,
  Stack,
  HStack,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  List,
  ListItem,
  ListIcon,
  Button,
  GridItem,
  Grid,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

import { FaCheckCircle } from "react-icons/fa";
import { FaTimesCircle } from "react-icons/fa";

import { useHistory } from "react-router-dom";

import { InfoIcon } from "@chakra-ui/icons";

import { useState, useEffect } from "react";
import { projectAuth, projectFirestore } from "../firebase/config";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePlan } from "../hooks/usePlan";

function PriceWrapper({ children }) {
  return (
    <Box
      mb={4}
      shadow="base"
      borderWidth="1px"
      alignSelf={{ base: "center", lg: "flex-start" }}
      borderColor="gray.500"
      borderRadius={"xl"}
    >
      {children}
    </Box>
  );
}

const PricingPlans = ({ plans }) => {
  //const { history } = useHistory();
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [pPlans, setPricingPlans] = useState(null);
  const { dispatch } = useAuthContext();

  const { changePlan } = usePlan();
  useEffect(() => {
    if (plans) setPricingPlans(plans);
  }, []);
  // get logged in user
  const { user } = useAuthContext();
  let history = useHistory();

  const buyNow = async (plan) => {
    setError(null);
    setIsPending(true);

    console.log(plan.id);
    try {
      // update online status
      const documentRef = projectFirestore.collection("users").doc(user.uid);
      await documentRef.update({ planId: plan.id });
      changePlan(plan);
      console.log(user);
      setIsPending(false);
      setError(null);
      history.push("/");
    } catch (err) {
      setError(err.message);
      setIsPending(false);
    }
  };
  const breakpoints = {
    sm: "30em", // 480px
    md: "48em", // 768px
    lg: "62em", // 992px
    xl: "80em", // 1280px
    "2xl": "96em", // 1536px
  };
  return (
    <>
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}
      {error && (
        <Alert status="info">
          <InfoIcon />
          ...Proceeding to payment
        </Alert>
      )}
      <br></br>
      <br></br>
      {pPlans && (
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(2, 1fr)",
            xl: "repeat(3, 1fr)",
          }}
          gap={6}
          m={{
            base: "40px 200px 40px 200px",
            sm: "40px 20px 40px 20px",
            md: "40px 20px 40px 20px",
            lg: "40px 200px 40px 200px",
          }}
          spacing={{ base: 4, lg: 10 }}
        >
          {pPlans.map((plan) => (
            <GridItem w="100%" key={plan.id}>
              <PriceWrapper>
                <Box
                  py={4}
                  px={{ base: "12px", sm: "12px", md: "12px", lg: "12px" }}
                >
                  <Text fontWeight="100" fontSize="md" align="left">
                    {plan.NoOfGuests_start} - {plan.NoOfGuests_end} Guests
                  </Text>

                  <Text
                    fontWeight="500"
                    fontSize="2xl"
                    textTransform="uppercase"
                    mr="20px"
                  >
                    {plan.Name}
                  </Text>

                  <HStack justifyContent="left">
                    <Text fontSize="3xl" fontWeight="600">
                      $
                    </Text>
                    <Text fontSize="5xl" fontWeight="900">
                      {plan.Price}
                    </Text>
                    <Text fontSize="3xl" fontWeight="600">
                      USD
                    </Text>
                  </HStack>
                </Box>
                <VStack bg="gray.50" py={4} borderBottomRadius={"xl"}>
                  <List spacing={3} textAlign="start" px={0}>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      Unlimited photos and Guestbook
                    </ListItem>
                    <ListItem>
                      <ListIcon
                        as={plan.Videos ? "FaCheckCircle" : "FaTimesCircle"}
                        color={plan.Videos ? "green.500" : "red.500"}
                      />
                      Video Uploads
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      Photo {plan.Videos ? "& Video" : ""}
                      Slideshow
                    </ListItem>

                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      Private QR Code and URL
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      12 month Storage & Zip Download
                    </ListItem>
                  </List>
                  <Box w="80%" pt={7}>
                    <Button
                      w="full"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => buyNow(plan)}
                    >
                      Buy Now
                    </Button>
                  </Box>
                </VStack>
              </PriceWrapper>
            </GridItem>
          ))}

          <GridItem w="100%">
            <PriceWrapper>
              <Box py={4} px={12}>
                <Text fontWeight="500" fontSize="2xl">
                  FESTIVAL
                </Text>
                <br></br>
                <br></br>
                <br></br>
                <br></br>
              </Box>
              <VStack bg="gray.50" py={4} borderBottomRadius={"xl"}>
                <List spacing={3} textAlign="start" px={12}>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Unlimited photos and Guestbook
                  </ListItem>
                  <ListItem>
                    <ListIcon as="FaCheckCircle" color="green.500" />
                    Video Uploads
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Photo & Video Slideshow
                  </ListItem>

                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Private QR Code and URL
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    12 month Storage & Zip Download
                  </ListItem>
                </List>
                <Box w="80%" pt={7}>
                  <Button w="full" colorScheme="red" variant="outline">
                    Contact Us
                  </Button>
                </Box>
              </VStack>
            </PriceWrapper>
          </GridItem>
        </Grid>
      )}
    </>
  );
};

export default PricingPlans;
