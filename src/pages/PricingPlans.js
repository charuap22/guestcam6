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
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

import { FaCheckCircle, FaClosedCaptioning } from "react-icons/fa";
import { FaTimesCircle } from "react-icons/fa";

import { useHistory } from "react-router-dom";

import { InfoIcon } from "@chakra-ui/icons";

import { useState, useEffect } from "react";
import {
  projectAuth,
  projectFirestore,
  timestamp,
  functions,
} from "../firebase/config";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePlan } from "../context/PlanContext";
import { loadStripe } from "@stripe/stripe-js";
import firebase from "firebase/app";
import "firebase/firestore";

const stripePromise = loadStripe(
  "pk_test_51ON2hWSEvkmhv8YortybVWKWOmHB2FrAYv63805VFuJ2WvknLw47fyynmJKNqLUKld7aEKoPfrdkzSnjDnO082LX00K4JmPKzf"
); // Replace with your publishable key

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

  const [loading, setLoading] = useState(false);
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

    try {
      // update plan subscription
      const subscribedOn = timestamp.fromDate(new Date());
      const documentRef = projectFirestore.collection("users").doc(user.uid);
      await documentRef.update({ planId: plan.id, subscribedOn: subscribedOn });
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

  const checkout2 = async (user, priceId, productKey) => {
    console.log("Checkout started");
    setError(null);
    setIsPending(true);

    if (!user || !user.uid) {
      console.error("User is not authenticated");
      return;
    }

    try {
      const sessionRef = await projectFirestore
        .collection("customers")
        .doc(user.uid)
        .collection("checkout_sessions")
        .doc(); // Create a reference without adding immediately  const sessionId = sessionRef.id; // Use this ID for the Firestore document

      const sessionId = sessionRef.id; // Use this ID for the Firestore document

      await sessionRef.set({
        sessionId: sessionId, // Store the session ID inside Firestore
        mode: "payment",
        price: priceId,
        success_url: `http://localhost:3000/success?session_id=${sessionId}`,
        cancel_url: "http://localhost:3000/cancel",
        createdAt: new Date(),
        metadata: {
          userId: user.uid,
          planId: productKey,
        },
      });

      // Wait for the CheckoutSession to get attached by the extension
      console.log("Session document created with ID:", sessionId);

      // Wait for the CheckoutSession to get attached by the extension
      sessionRef.onSnapshot((snap) => {
        const { error, url } = snap.data();
        if (error) {
          alert(`An error occurred: ${error.message}`);
        }
        if (url) {
          window.location.assign(url);
        }
      });
    } catch (err) {
      console.error("Firestore error:", err.message);
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
          {Object.keys(plans).map((productKey) => {
            const product = plans[productKey];
            console.log(product.prices);
            if (
              !product.prices ||
              !Array.isArray(product.prices) ||
              product.prices.length === 0
            ) {
              console.warn(
                `Warning: No prices found for product: ${product.id}`
              );
            }
            const unitAmount = product.prices?.priceData?.unit_amount ?? 0;
            const currency = product.prices?.priceData?.currency ?? "USD";
            const priceInDollars = (unitAmount / 100).toFixed(2); // Convert to dollars

            return (
              <div key={productKey}>
                <GridItem w="100%">
                  <PriceWrapper>
                    <Box py={4} px={12}>
                      <Text fontWeight="300" fontSize="16px">
                        {product.description} ({" "}
                        {product.stripe_metadata_NoOfGuests_start} -{" "}
                        {product.stripe_metadata_NoOfGuests_end} Guests )
                      </Text>
                      <Text fontWeight="700" fontSize="3xl" mb={0}>
                        {product.name}
                      </Text>

                      <Stack direction="row" alignItems="center">
                        {" "}
                        {/* Align items vertically */}
                        <Text fontSize="5xl" fontWeight="900">
                          {priceInDollars}{" "}
                        </Text>
                        <Text
                          color="gray.500"
                          fontSize="3xl"
                          fontWeight="600"
                          textTransform="uppercase"
                        >
                          {currency}
                        </Text>
                      </Stack>
                    </Box>
                    {/* Feature List with Checkmarks ✅ and Cross ❌ */}
                    <VStack bg="gray.50" py={4} borderBottomRadius={"xl"}>
                      <List spacing={3} textAlign="start" px={12}>
                        {Object.entries(product.metadata).map(
                          ([feature, value], index) => (
                            <ListItem key={index}>
                              {value === "1" ? (
                                <ListIcon
                                  as={FaCheckCircle}
                                  color="green.500"
                                />
                              ) : (
                                <ListIcon as={FaTimesCircle} color="red.500" />
                              )}
                              {feature}
                            </ListItem>
                          )
                        )}
                      </List>
                      <Box w="80%" pt={7}>
                        <Button
                          w="full"
                          colorScheme="red"
                          variant="outline"
                          onClick={() =>
                            checkout2(user, product.prices.priceId, productKey)
                          }
                        >
                          {loading ? "Loading..." : " Buy Now"}
                        </Button>
                      </Box>
                    </VStack>
                    {/* <VStack bg="gray.50" py={4} borderBottomRadius={"xl"}>
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
                            <Button
                              w="full"
                              colorScheme="red"
                              variant="outline"
                            >
                              Buy Now
                            </Button>
                          </Box>
                        </VStack> */}
                  </PriceWrapper>
                </GridItem>
              </div>
            );
          })}
        </Grid>
      )}
    </>
  );
};

export default PricingPlans;
