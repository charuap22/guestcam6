import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  GridItem,
  VStack,
  Text,
  Button,
  List,
  ListItem,
  ListIcon,
  Spinner,
  Flex,
  HStack,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { projectFirestore, projectAuth } from "../firebase/config";

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(null);
    const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = projectAuth.currentUser;

        const plansPromise = projectFirestore.collection("products").get();
        const subscriptionPromise = user
          ? projectFirestore
              .collection("customers")
              .doc(user.uid)
              .collection("purchases")
              .orderBy("purchasedAt", "desc")
              .limit(1)
              .get()
          : Promise.resolve(null);

        const [plansSnapshot, purchaseSnapshot] = await Promise.all([
          plansPromise,
          subscriptionPromise,
        ]);

        const plansData = await Promise.all(
          plansSnapshot.docs.map(async (doc) => {
            const productData = doc.data();
            if (!productData.active) return null;

            const pricesSnap = await doc.ref.collection("prices").get();
            const prices = pricesSnap.docs.map((priceDoc) => ({
              id: priceDoc.id,
              ...priceDoc.data(),
            }));

            return { id: doc.id, ...productData, prices };
          })
        );

        setPlans(plansData.filter(Boolean)); // Remove null values
        setCurrentSubscription(
          purchaseSnapshot && !purchaseSnapshot.empty
            ? purchaseSnapshot.docs[0].data()
            : null
        );
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch plans. Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);
  const [loadingPlan, setLoadingPlan] = useState(null); // Track which plan is loading

const handleCheckout = async (user, priceId, productKey, price) => {
  if (!user || !user.uid) {
    alert("Please sign in to purchase a plan.");
    return;
  }

  const newPlan = plans.find((p) => p.id === productKey);
  const newPrice = newPlan?.prices[0].unit_amount / 100;
  const currentPlanPrice = parseFloat(currentSubscription?.price || 0);

  if (currentSubscription?.planId === productKey) {
    alert("You are already subscribed to this plan.");
    return;
  }

  if (currentSubscription && newPrice < currentPlanPrice) {
    alert("Downgrades are not supported at this time.");
    return;
  }

  const extraAmount = (newPrice - currentPlanPrice).toFixed(2);
  if (currentSubscription && currentSubscription.planId) {
    const confirmUpgrade = window.confirm(
      `Upgrading: You will be charged an additional $${extraAmount}. Continue?`
    );
    if (!confirmUpgrade) return;
  }

  setLoadingPlan(productKey);
  try {
    const sessionRef = projectFirestore
      .collection("customers")
      .doc(user.uid)
      .collection("checkout_sessions")
      .doc();

    const sessionId = sessionRef.id;

    await sessionRef.set({
      sessionId,
      mode: "payment",
      success_url: `http://localhost:3000/success?session_id=${sessionId}`,
      cancel_url: "http://localhost:3000/cancel",
      createdAt: new Date(),
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: currentSubscription
                ? `Upgrade to ${newPlan.name}`
                : `${newPlan.name}`,
            },
            unit_amount: extraAmount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.uid,
        planId: productKey,
        planName: newPlan.name, 
        price,
        upgrade: currentSubscription ? "true" : "false",
        oldPlanId: currentSubscription?.planId || "",
      },
    });

    // 🔥 Poll Firestore every 500ms until session URL appears
    const checkSessionURL = async () => {
      let retries = 10; // Stop after 5 seconds (10 x 500ms)
      while (retries > 0) {
        const sessionDoc = await sessionRef.get();
        const sessionData = sessionDoc.data();

        if (sessionData?.url) {
          window.location.assign(sessionData.url); // ✅ Redirect immediately when URL exists
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retrying
        retries--;
      }

      throw new Error("Session URL not found after multiple retries.");
    };

    await checkSessionURL();
  } catch (err) {
    console.error("Firestore error:", err.message);
    toast({
      title: "Error",
      description: "Failed to start checkout. Please try again later.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setLoadingPlan(null);
  }
};



  if (loading) {
    return (
      <Flex wrap="wrap" justify="center" width="100%" p={6}>
        {[...Array(3)].map((_, index) => (
          <Box
            key={index}
            borderWidth="1px"
            borderRadius="lg"
            p={6}
            m={4}
            width="320px"
            boxShadow="lg"
            textAlign="left"
          >
            <Skeleton height="20px" width="60%" mb={4} />
            <SkeletonText mt="4" noOfLines={4} spacing="4" />
            <Skeleton height="40px" width="100%" mt={4} borderRadius="md" />
          </Box>
        ))}
      </Flex>
    );
  }

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <Text fontSize="4xl" fontWeight="bold" textAlign="center" mb={6}>
        Choose a Plan
      </Text>
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
        {plans.map((plan) => {
          if (!plan.prices || plan.prices.length === 0) {
            return null; // Don't render plans without a price
          }
          const price = plan.prices?.[0];
          const amount = price ? (price.unit_amount / 100).toFixed(2) : "N/A";
          // Extract guest range
          const guestStart = plan.metadata?.NoOfGuests_start || "0";
          const guestEnd = plan.metadata?.NoOfGuests_end || "Unlimited";
          const sortedFeatures = Object.entries(plan.metadata || {})
            .filter(
              ([key]) => key !== "NoOfGuests_start" && key !== "NoOfGuests_end"
            )
            .sort(([a], [b]) => a.localeCompare(b));

          const isCurrentPlan =
            currentSubscription && currentSubscription.planId === plan.id;

          
          const currentPlanPrice = currentSubscription
            ? parseFloat(currentSubscription.price)
            : 0;
          const newPlanPrice = price ? price.unit_amount / 100 : 0;
          const isDowngrade =
            currentSubscription && newPlanPrice < currentPlanPrice;
const isUpgrade = currentSubscription && newPlanPrice > currentPlanPrice;
const upgradeCost = isUpgrade
  ? (newPlanPrice - currentPlanPrice).toFixed(2)
  : 0;

          return (
            <GridItem
              key={plan.id}
              borderWidth="2px"
              borderRadius="lg"
              p={6}
              m={4}
              width="320px"
              boxShadow="lg"
              textAlign="left"
              position="relative"
              bg={isCurrentPlan ? "blue.50" : "white"}
              borderColor={isCurrentPlan ? "blue.500" : "gray.200"}
            >
              <VStack spacing={0}>
                {/* Badge for Current Plan */}
                {isCurrentPlan && (
                  <Box
                    position="absolute"
                    top="-3"
                    left="50%"
                    transform="translateX(-50%)"
                    bg="blue.500"
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    Active Plan
                  </Box>
                )}
                <Text fontSize="2xl" fontWeight="bold">
                  {plan.name}
                  {isCurrentPlan}
                </Text>
                <Text>{plan.description}</Text>
                <Text fontSize="3xl" fontWeight="bold" color="#e6c250">
                  ${amount} USD
                </Text>
                {isUpgrade && upgradeCost > 0 && (
                  <Text fontSize="sm" color="blue.600" mt={2}>
                    Upgrading: Pay an additional <strong>${upgradeCost}</strong>{" "}
                    today.
                  </Text>
                )}
           
                <List spacing={0} textAlign="start" px={4}>
                  {sortedFeatures.map(([feature, value], index) => {
                    return (
                      <ListItem key={index}>
                        <HStack spacing={3} alignItems="flex-start">
                          <ListIcon
                            as={value === "1" ? FaCheckCircle : FaTimesCircle}
                            color={value === "1" ? "green.500" : "red.500"}
                            mt="3px" // Slight adjustment to align with text
                          />
                          <Text>{feature.replace(/_/g, " ")}</Text>
                        </HStack>
                      </ListItem>
                    );
                  })}
                </List>
                )
                <Tooltip
                  label="Downgrade is not allowed"
                  isDisabled={!isDowngrade}
                >
                  <Button
                    mt={4}
                    width="100%"
                    bg={isCurrentPlan ? "gray.400" : "#e6c250"}
                    color="white"
                    isDisabled={isCurrentPlan | isDowngrade}
                    _hover={!isCurrentPlan ? { bg: "#d6b250" } : {}}
                    onClick={() =>
                      handleCheckout(
                        projectAuth.currentUser,
                        plan.prices?.[0]?.id,
                        plan.id,
                        amount
                      )
                    }
                    isLoading={loadingPlan === plan.id} // Only show loading for this plan
                  >
                    {loadingPlan === plan.id
                      ? "Redirecting..."
                      : `Buy Now  |  ${guestStart} - ${guestEnd} Guests`}
                  </Button>
                </Tooltip>
              </VStack>
            </GridItem>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Pricing;
