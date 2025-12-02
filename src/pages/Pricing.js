import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Icon,
  Stack,
  UnorderedList,
  ListItem,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { projectFirestore, projectAuth } from "../firebase/config";
import { CheckIcon } from "@chakra-ui/icons";
import { usePlan } from "../context/PlanContext";
import { useHistory } from "react-router-dom";

export default function GuestPovPricing() {
  // Light/dark support
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const accentGold = "#C5A572"; // warm gold tone
  const borderGold = "rgba(197, 165, 114, 0.4)";
  const textGold = "#B89152";

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const toast = useToast();
  const history = useHistory();

  // Plan context (optional) — used to update client state immediately after demo activation
  let updatePlan = null;
  try {
    const planCtx = usePlan();
    updatePlan = planCtx?.updatePlan || null;
  } catch (err) {
    updatePlan = null;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = projectAuth.currentUser;

        // fetch products from Firestore (products collection)
        const plansSnapshot = await projectFirestore
          .collection("products")
          .get();

        // fetch latest purchase for current user
        let purchaseSnapshot = null;
        if (user) {
          purchaseSnapshot = await projectFirestore
            .collection("customers")
            .doc(user.uid)
            .collection("purchases")
            .orderBy("purchasedAt", "desc")
            .limit(1)
            .get();
        }

        const plansData = await Promise.all(
          plansSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            if (!data.active) return null;

            const pricesSnap = await doc.ref.collection("prices").get();
            const prices = pricesSnap.docs.map((p) => ({
              id: p.id,
              ...p.data(),
            }));

            return {
              id: doc.id,
              name: data.name,
              description: data.description,
              metadata: data.metadata || {},
              prices,
            };
          })
        );

        setPlans(plansData.filter(Boolean));

        setCurrentSubscription(
          purchaseSnapshot && !purchaseSnapshot.empty
            ? purchaseSnapshot.docs[0].data()
            : null
        );
      } catch (err) {
        console.error("Error fetching plans:", err);
        toast({
          title: "Error",
          description: "Failed to load plans.",
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleCheckout = async (user, priceId, productKey, price) => {
    if (!user || !user.uid) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase.",
        status: "info",
        duration: 3000,
      });
      return;
    }

    const newPlan = plans.find((p) => p.id === productKey);
    const newPrice = newPlan?.prices?.[0]?.unit_amount / 100 || 0;
    const currentPlanPrice = parseFloat(currentSubscription?.price || 0);

    if (currentSubscription?.planId === productKey) {
      toast({
        title: "Already subscribed",
        description: "You are already subscribed to this plan.",
        status: "info",
      });
      return;
    }

    if (currentSubscription && newPrice < currentPlanPrice) {
      toast({
        title: "Downgrade not allowed",
        description: "Downgrades are not supported.",
        status: "warning",
      });
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
              unit_amount: Math.round(extraAmount * 100),
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

      const checkSessionURL = async () => {
        let retries = 10;
        while (retries > 0) {
          const sessionDoc = await sessionRef.get();
          const sessionData = sessionDoc.data();
          if (sessionData?.url) {
            window.location.assign(sessionData.url);
            return;
          }
          await new Promise((r) => setTimeout(r, 500));
          retries--;
        }
        throw new Error("Session URL not found after multiple retries.");
      };

      await checkSessionURL();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to start checkout.",
        status: "error",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  /**
   * DEMO FLOW (no charge)
   * - writes a demo purchase doc in customers/{uid}/purchases
   * - updates users/{uid} with plan info
   * - optionally updates client PlanContext if available
   * - redirects to /admin/dashboard on success
   */
  const handleActivateDemo = async (productKey, planName, priceAmount = 0) => {
    const user = projectAuth.currentUser;
    if (!user || !user.uid) {
      toast({
        title: "Sign in required",
        description: "Please sign in to activate a demo plan.",
        status: "info",
        duration: 3000,
      });
      return;
    }

    setLoadingPlan(productKey);
    try {
      const purchasedAt = new Date();
      const subscriptionEndDate = new Date(purchasedAt);
      // Demo duration: 7 days (adjust if needed)
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 7);

      const userRef = projectFirestore.collection("users").doc(user.uid);
      const purchaseRef = projectFirestore
        .collection("customers")
        .doc(user.uid)
        .collection("purchases")
        .doc(); // auto ID

      // Update user doc and add purchase doc
      await userRef.set(
        {
          planId: productKey,
          planName,
          price: 0,
          subscribedOn: purchasedAt,
          subscriptionEndDate,
          subscriptionStatus: "active",
          demo: true,
        },
        { merge: true }
      );

      await purchaseRef.set({
        planId: productKey,
        planName,
        price: 0,
        purchasedAt,
        subscriptionEndDate,
        previousPlanId: currentSubscription?.planId || null,
        status: "demo",
        demo: true,
      });

      // Try updating PlanContext if available
      try {
        if (updatePlan) {
          updatePlan({
            planId: productKey,
            planName,
            price: 0,
            demo: true,
          });
        }
      } catch (err) {
        console.warn("PlanContext not available or updatePlan failed:", err);
      }

      toast({
        title: "Demo activated",
        description: `Demo for "${planName}" is active for 7 days.`,
        status: "success",
        duration: 3000,
      });

      // Update local state so UI reflects new subscription immediately
      setCurrentSubscription({
        planId: productKey,
        planName,
        price: 0,
        purchasedAt,
        subscriptionEndDate,
        status: "demo",
      });

      // Redirect user to dashboard
      history.push("/admin/dashboard");
    } catch (err) {
      console.error("Demo activation failed:", err);
      toast({
        title: "Error",
        description: "Failed to activate demo plan.",
        status: "error",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  // Show skeleton while loading
  if (loading) {
    return (
      <Flex wrap="wrap" justify="center" width="100%" p={6}>
        {[...Array(3)].map((_, i) => (
          <Box
            key={i}
            borderWidth="1px"
            borderRadius="lg"
            p={6}
            m={4}
            width={{ base: "100%", md: "320px" }}
            boxShadow="lg"
            textAlign="left"
            bg={cardBg}
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
    <Box as="section" bg={bg} py={{ base: 10, md: 16 }} px={{ base: 4, md: 8 }}>
      <Flex maxW="1200px" mx="auto" direction="column" gap={6} align="stretch">
        {/* Header */}
        <VStack spacing={3} align="center" mb={6}>
          <Badge
            color={textGold}
            border={`1px solid ${borderGold}`}
            px={3}
            py={1}
            borderRadius="full"
          >
            GuestPov
          </Badge>
          <Heading as="h2" size="xl" lineHeight={1.05} color={headingColor}>
            Pricing Plans
          </Heading>
          <Text color="gray.600" maxW="720px" textAlign="center">
            Simple, transparent pricing for events of any size. Create
            galleries, add albums for separate occasions, and download each
            album separately.
          </Text>
        </VStack>

        {/* Pricing Grid */}
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={{ base: 6, md: 8 }}
          align="stretch"
        >
          {plans.map((plan) => {
            const priceObj = plan.prices?.[0];
            const amount = priceObj
              ? (priceObj.unit_amount / 100).toFixed(0)
              : "N/A";

            const featureEntries = Object.entries(plan.metadata || {})
              .filter(([k]) => k.startsWith("feature_"))
              .map(([k, v]) => [k.replace(/^feature_/, ""), v]);

            const isCurrentPlan =
              currentSubscription && currentSubscription.planId === plan.id;
            const currentPlanPrice = currentSubscription
              ? parseFloat(currentSubscription.price)
              : 0;
            const newPlanPrice = priceObj ? priceObj.unit_amount / 100 : 0;
            const isDowngrade =
              currentSubscription && newPlanPrice < currentPlanPrice;

            return (
              <Box
                key={plan.id}
                bg={cardBg}
                borderRadius="20px"
                boxShadow={
                  plan.metadata?.recommended
                    ? "0 25px 40px rgba(0,0,0,0.1)"
                    : "0 10px 25px rgba(0,0,0,0.05)"
                }
                border={
                  plan.metadata?.recommended
                    ? `2px solid ${accentGold}`
                    : `1px solid ${borderGold}`
                }
                flex="1"
                p={{ base: 6, md: 8 }}
                position="relative"
                transition="all 0.3s ease"
                _hover={{
                  transform: "translateY(-6px)",
                  boxShadow: "0 30px 45px rgba(0,0,0,0.12)",
                }}
              >
                {/* Recommended badge — keep it but move to left when current plan also exists */}
                {plan.metadata?.recommended && !isCurrentPlan && (
                  <Badge
                    position="absolute"
                    top={4}
                    right={4}
                    bg={accentGold}
                    color="white"
                    fontWeight={700}
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    Recommended
                  </Badge>
                )}

                {plan.metadata?.recommended && isCurrentPlan && (
                  <Badge
                    position="absolute"
                    top={4}
                    left={4} // shift to left so it doesn't overlap the Current Plan badge
                    bg={accentGold}
                    color="white"
                    fontWeight={700}
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    Recommended
                  </Badge>
                )}

                {/* Current Plan badge at top-right */}
                {isCurrentPlan && (
                  <Badge
                    position="absolute"
                    top={4}
                    right={4}
                    bg="#38A169" // green to distinguish current plan (you can use accentGold if you prefer)
                    color="white"
                    fontWeight={700}
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    Current Plan
                  </Badge>
                )}

                <VStack align="start" spacing={5}>
                  <Heading
                    as="h3"
                    fontSize={{ base: "2xl", md: "3xl" }}
                    color={plan.metadata?.recommended ? textGold : "gray.800"}
                    fontWeight="800"
                  >
                    {plan.name}
                  </Heading>

                  <HStack align="baseline" spacing={1}>
                    <Text
                      fontSize={{ base: "3xl", md: "4xl" }}
                      fontWeight={900}
                      color={accentGold}
                    >
                      ${amount}
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      USD
                    </Text>
                  </HStack>

                  <Text
                    color="gray.600"
                    fontSize="lg"
                    fontWeight="500"
                    letterSpacing="0.02em"
                  >
                    {plan.description ||
                      (plan.name === "Lite"
                        ? "Perfect for one special event."
                        : plan.name === "Flex"
                        ? "Most popular choice for weddings and family events."
                        : "For multi-day, large-scale celebrations.")}
                  </Text>

                  <UnorderedList spacing={2} pl={0} styleType="none" w="100%">
                    {(() => {
                      const meta = plan.metadata || {};

                      const canonicalOrder = [
                        "feature_Main Gallery",
                        "feature_Design Themes",
                        "feature_Month Upload",
                        "feature_Month Download Window",
                      ];

                      const normalizeKey = (k) =>
                        String(k || "")
                          .toLowerCase()
                          .replace(/^feature_/, "")
                          .replace(/[\-_\.]/g, " ")
                          .replace(/\bmonths?\b/, "month")
                          .replace(/\s+/g, " ")
                          .trim();

                      const featureKeys = Object.keys(meta).filter((k) =>
                        k.startsWith("feature_")
                      );
                      const normMap = featureKeys.reduce((acc, k) => {
                        acc[normalizeKey(k)] = k;
                        return acc;
                      }, {});

                      const availableKeysInOrder = canonicalOrder
                        .map((canon) => {
                          const canonNorm = normalizeKey(canon);
                          if (canonNorm in normMap) return normMap[canonNorm];
                          const found = Object.keys(normMap).find(
                            (nk) =>
                              nk.includes(canonNorm) || canonNorm.includes(nk)
                          );
                          return found ? normMap[found] : null;
                        })
                        .filter(Boolean);

                      return availableKeysInOrder.map((key, index) => (
                        <ListItem
                          key={key}
                          display="flex"
                          alignItems="center"
                          gap={3}
                          py={0}
                          borderBottom={
                            index === availableKeysInOrder.length - 1
                              ? "none"
                              : "1px solid rgba(0,0,0,0.05)"
                          }
                        >
                          <Box
                            bg={accentGold}
                            w="20px"
                            h="20px"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                          >
                            <Icon as={CheckIcon} color="white" boxSize={3} />
                          </Box>

                          <Text fontSize="md" color="gray.700" pl={1} mt={3}>
                            {meta[key]}
                          </Text>
                        </ListItem>
                      ));
                    })()}
                  </UnorderedList>

                  {/* ACTIONS: Buy, Demo */}
                  <HStack width="100%" spacing={3}>
                    {!projectAuth.currentUser ? (
                      <Button
                        mt={3}
                        size="lg"
                        width="full"
                        borderRadius="full"
                        bg="gray.300"
                        color="gray.600"
                        border={`2px solid ${accentGold}`}
                        cursor="not-allowed"
                      >
                        Sign in to continue
                      </Button>
                    ) : (
                      <Tooltip
                        label={isDowngrade ? "Downgrade is not allowed" : ""}
                        isDisabled={!isDowngrade}
                      >
                        <Button
                          mt={3}
                          size="lg"
                          width="full"
                          borderRadius="full"
                          bg={
                            plan.metadata?.recommended
                              ? accentGold
                              : "transparent"
                          }
                          color={
                            plan.metadata?.recommended ? "white" : accentGold
                          }
                          border={`2px solid ${accentGold}`}
                          _hover={{
                            bg: plan.metadata?.recommended
                              ? "#b89350"
                              : accentGold,
                            color: "white",
                          }}
                          transition="all 0.3s ease"
                          isDisabled={isCurrentPlan || isDowngrade}
                          onClick={() =>
                            handleCheckout(
                              projectAuth.currentUser,
                              priceObj?.id,
                              plan.id,
                              amount
                            )
                          }
                          isLoading={loadingPlan === plan.id}
                        >
                          {loadingPlan === plan.id
                            ? "Redirecting..."
                            : plan.metadata?.cta_text || "Choose"}
                        </Button>
                      </Tooltip>
                    )}
                  </HStack>

                  {/* Secondary actions row: Demo */}
                  <HStack width="100%" spacing={3} mt={2}>
                    <Button
                      width="full"
                      size="sm"
                      borderRadius="full"
                      variant="outline"
                      border={`1px solid ${borderGold}`}
                      onClick={() =>
                        handleActivateDemo(plan.id, plan.name, amount)
                      }
                      isLoading={loadingPlan === plan.id}
                      isDisabled={!projectAuth.currentUser || isCurrentPlan}
                    >
                      Activate Demo (no charge)
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            );
          })}
        </Stack>

        <Text fontSize="sm" color="gray.500" mt={6} textAlign="center">
          Prices shown in USD. All plans include secure storage and downloadable
          albums for every event.
        </Text>
      </Flex>
    </Box>
  );
}
