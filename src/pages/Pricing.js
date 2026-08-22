// src/pages/GuestPovPricing.js
import React, { useEffect, useState, useCallback } from "react";
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
  Input,
  useToast,
} from "@chakra-ui/react";
import { projectFirestore, projectAuth } from "../firebase/config";
import { CheckIcon } from "@chakra-ui/icons";
import { usePlan } from "../context/PlanContext";
import { useHistory } from "react-router-dom";
import { getReferralCode, setReferralCode } from "../utils/referral";

import { useLocation } from "react-router-dom";

export default function GuestPovPricing() {
  const location = useLocation();
  const allowUpgrade = location.state?.allowUpgrade === true;

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

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [referralCode, setReferralCodeInput] = useState("");
  const [referral, setReferral] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);

  const toast = useToast();
  const history = useHistory();

  const { currentPlan, loading: planLoading } = usePlan();

  // Plan context (optional) — used to update client state immediately after demo activation
  let updatePlan = null;
  try {
    const planCtx = usePlan();
    updatePlan = planCtx?.updatePlan || null;
  } catch (err) {
    updatePlan = null;
  }

  // fetchData: loads plans and (if signed in) latest purchase for current user
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const user = projectAuth.currentUser;

      // fetch products from Firestore (products collection)
      const plansSnapshot = await projectFirestore.collection("products").get();

      // fetch latest purchase for current user (if logged in)
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
        }),
      );

      setPlans(plansData.filter(Boolean));

      setCurrentSubscription(
        purchaseSnapshot && !purchaseSnapshot.empty
          ? purchaseSnapshot.docs[0].data()
          : null,
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
  }, [toast]);

  console.log("💰 Pricing page rendered");

  // initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (planLoading) return;

    // User already has a plan AND did NOT come for upgrade
    if (currentPlan && !allowUpgrade) {
      history.replace("/admin/dashboard");
    }
  }, [currentPlan, planLoading, allowUpgrade, history]);

  // keep currentSubscription in sync with auth state.
  // clear subscription on sign-out and re-fetch data on sign-in
  useEffect(() => {
    const unsubscribe = projectAuth.onAuthStateChanged((u) => {
      if (!u) {
        setCurrentSubscription(null);
      } else {
        // user signed in -> refresh plans + purchases for this user
        fetchData();
      }
    });
    return () => unsubscribe();
  }, [fetchData]);

  // prefill the referral code input if the visitor arrived via a ?ref= link
  // or applied one on a previous visit. The code still travels with checkout
  // (see getReferralCode() fallback in handleCheckout's metadata), but the
  // "Referral Applied" banner only shows after an explicit Apply click.
  useEffect(() => {
    const stored = getReferralCode();
    if (stored) {
      setReferralCodeInput(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyReferral = async (codeOverride) => {
    const code = (codeOverride || referralCode).trim();

    if (!code) return;

    try {
      setReferralLoading(true);

      const snapshot = await projectFirestore
        .collection("affiliates")
        .where("code", "==", code.toUpperCase())
        .limit(1)
        .get();

      if (snapshot.empty) {
        setReferral(null);

        toast({
          title: "Invalid referral code",
          status: "error",
        });

        return;
      }

      const affiliateData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

      if (!affiliateData.active) {
        setReferral(null);

        toast({
          title: "This referral code is no longer active",
          status: "error",
        });

        return;
      }

      setReferral(affiliateData);
      setReferralCode(affiliateData.code);

      toast({
        title: `Referral applied: ${affiliateData.name}`,
        status: "success",
      });
    } catch (err) {
      console.error(err);

      toast({
        title: "Failed to apply referral code",
        status: "error",
      });
    } finally {
      setReferralLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setCouponLoading(true);

      const snapshot = await projectFirestore
        .collection("coupons")
        .where("code", "==", couponCode.toUpperCase())
        .limit(1)
        .get();

      if (snapshot.empty) {
        setCoupon(null);

        toast({
          title: "Invalid coupon",
          status: "error",
        });

        return;
      }

      const couponData = snapshot.docs[0].data();

      if (!couponData.active) {
        toast({
          title: "Coupon disabled",
          status: "error",
        });
        return;
      }

      if (couponData.expiresAt && couponData.expiresAt.toDate() < new Date()) {
        toast({
          title: "Coupon expired",
          status: "error",
        });
        return;
      }

      setCoupon(couponData);

      if (couponData.type === "free_plan") {
        toast({
          title: "Gift Package Applied",
          status: "success",
        });
      } else {
        toast({
          title: `${couponData.value}% discount applied`,
          status: "success",
        });
      }
    } catch (err) {
      console.error(err);

      toast({
        title: "Failed to apply coupon",
        status: "error",
      });
    } finally {
      setCouponLoading(false);
    }
  };
  const activateGiftPlan = async (plan) => {
    const user = projectAuth.currentUser;

    if (!user) return;

    try {
      setLoadingPlan(plan.id);

      const purchasedAt = new Date();

      const userRef = projectFirestore.collection("users").doc(user.uid);

      const purchaseRef = projectFirestore
        .collection("customers")
        .doc(user.uid)
        .collection("purchases")
        .doc();

      await userRef.set(
        {
          planId: plan.id,
          planName: plan.name,
          price: 0,
          subscribedOn: purchasedAt,
          subscriptionStatus: "active",
          gift: true,
        },
        { merge: true },
      );

      await purchaseRef.set({
        planId: plan.id,
        planName: plan.name,
        price: 0,
        purchasedAt,
        status: "gift",
        gift: true,
        couponCode: coupon?.code || "",
      });

      // Update local state immediately
      setCurrentSubscription({
        planId: plan.id,
        planName: plan.name,
        price: 0,
        status: "gift",
      });

      if (updatePlan) {
        updatePlan({
          planId: plan.id,
          planName: plan.name,
          price: 0,
        });
      }

      console.log("Activating gift plan:", plan);
      toast({
        title: "Gift Package Activated",
        description: `${plan.name} has been activated successfully`,
        status: "success",
        duration: 3000,
      });

      if (coupon?.code) {
        const couponSnapshot = await projectFirestore
          .collection("coupons")
          .where("code", "==", coupon.code)
          .limit(1)
          .get();

        if (!couponSnapshot.empty) {
          const couponDoc = couponSnapshot.docs[0];

          await couponDoc.ref.update({
            usedCount: (couponDoc.data().usedCount || 0) + 1,
          });
        }
      }

      if (referral?.id) {
        await projectFirestore.collection("affiliateSales").add({
          affiliateId: referral.id,
          affiliateCode: referral.code,
          affiliateName: referral.name,
          saleAmount: 0,
          commissionRate: referral.commissionRate || 0,
          commissionAmount: 0,
          note: `${plan.name} (gift coupon)`,
          status: "unpaid",
          payoutId: null,
          createdAt: purchasedAt,
        });
      }

      setTimeout(() => {
        console.log("Redirecting to dashboard");
        history.replace("/admin/dashboard");
      }, 500);
    } catch (err) {
      console.error("Gift activation error:", err);
      console.error(err);

      toast({
        title: "Failed to activate package",
        status: "error",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCheckout = async (
    user,
    priceId,
    productKey,
    price,
    couponData = null,
  ) => {
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
    const originalPrice = newPlan?.prices?.[0]?.unit_amount / 100 || 0;

    const discountedPrice =
      coupon?.type === "percentage"
        ? originalPrice - (originalPrice * coupon.value) / 100
        : originalPrice;
    const currentPlanPrice = parseFloat(currentSubscription?.price || 0);

    if (currentSubscription?.planId === productKey) {
      toast({
        title: "Already subscribed",
        description: "You are already subscribed to this plan.",
        status: "info",
      });
      return;
    }

    if (currentSubscription && discountedPrice < currentPlanPrice) {
      toast({
        title: "Downgrade not allowed",
        description: "Downgrades are not supported.",
        status: "warning",
      });
      return;
    }

    const extraAmount = Math.max(0, discountedPrice - currentPlanPrice).toFixed(
      2,
    );
    if (currentSubscription && currentSubscription.planId) {
      const confirmUpgrade = window.confirm(
        `Upgrading: You will be charged an additional $${extraAmount}. Continue?`,
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
        automatic_tax: {
          enabled: true,
        },

        success_url: `https://guestpov.ca/success?session_id=${sessionId}`,
        cancel_url: "https://guestpov.ca/cancel",
        createdAt: new Date(),
        line_items: [
          {
            price_data: {
              currency: "cad",
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
          originalPrice,
          discountedPrice,
          chargedAmount: extraAmount,
          couponCode: couponData?.code || "",
          couponDiscount: couponData?.value || 0,
          affiliateCode: referral?.code || getReferralCode() || "",
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
    <>
      {" "}
      <Button
        position="absolute"
        top="20px"
        left="20px"
        zIndex={10}
        size="sm"
        bg="whiteAlpha.800"
        backdropFilter="blur(6px)"
        color="black"
        borderRadius="full"
        px={4}
        onClick={() => history.push("/")}
        _hover={{ bg: "white" }}
      >
        ← Back
      </Button>
      <Box
        as="section"
        bg={bg}
        py={{ base: 10, md: 16 }}
        px={{ base: 4, md: 8 }}
      >
        <Flex
          maxW="1200px"
          mx="auto"
          direction="column"
          gap={6}
          align="stretch"
        >
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

          <Flex justify="center" gap={3} mb={8} wrap="wrap">
            <Input
              maxW="250px"
              placeholder="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />

            <Button
              onClick={applyCoupon}
              isLoading={couponLoading}
              bg={accentGold}
              color="white"
            >
              Apply Coupon
            </Button>
          </Flex>

          <Flex justify="center" gap={3} mb={8} wrap="wrap">
            <Input
              maxW="250px"
              placeholder="Referral Code"
              value={referralCode}
              onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
            />

            <Button
              onClick={() => applyReferral()}
              isLoading={referralLoading}
              bg={accentGold}
              color="white"
            >
              Apply Referral
            </Button>
          </Flex>

          {referral && (
            <Box
              bg="green.50"
              border="1px solid"
              borderColor="green.200"
              p={3}
              borderRadius="md"
              textAlign="center"
              mb={6}
            >
              ✅ Referral Applied: {referral.name} ({referral.code})
            </Box>
          )}

          {coupon?.type === "percentage" && (
            <Box
              bg="green.50"
              border="1px solid"
              borderColor="green.200"
              p={3}
              borderRadius="md"
              textAlign="center"
              mb={6}
            >
              🎉 Coupon Applied: {coupon.code} ({coupon.value}% OFF)
            </Box>
          )}

          {coupon?.type === "free_plan" && (
            <Box
              bg="green.50"
              border="1px solid"
              borderColor="green.200"
              p={3}
              borderRadius="md"
              textAlign="center"
              mb={6}
            >
              🎁 Gift Package Applied
              <br />
              This package will be activated free of charge.
            </Box>
          )}
          {/* Pricing Grid */}
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={{ base: 6, md: 8 }}
            align="stretch"
          >
            {plans.map((plan) => {
              const priceObj = plan.prices?.[0];
              const originalPrice = priceObj ? priceObj.unit_amount / 100 : 0;

              const discountedPrice = coupon
                ? originalPrice - (originalPrice * coupon.value) / 100
                : originalPrice;

              const amount = discountedPrice.toFixed(0);

              const featureEntries = Object.entries(plan.metadata || {})
                .filter(([k]) => k.startsWith("feature_"))
                .map(([k, v]) => [k.replace(/^feature_/, ""), v]);

              // only show current plan badge if user is signed in AND subscription matches
              {
                /* const isCurrentPlan =
                projectAuth.currentUser &&
                currentSubscription &&
                currentSubscription.planId === plan.id; */
              }
              const isCurrentPlan =
                !!currentSubscription?.planId &&
                currentSubscription.planId === plan.id;

              {
                /* const currentPlanPrice = currentSubscription
                ? parseFloat(currentSubscription.price)
                : 0;
              const newPlanPrice = priceObj ? priceObj.unit_amount / 100 : 0;
              const isDowngrade =
                currentSubscription && newPlanPrice < currentPlanPrice; */
              }

              const currentPlan = plans.find(
                (p) => p.id === currentSubscription?.planId,
              );

              const currentPlanPrice =
                Number(currentPlan?.prices?.[0]?.unit_amount || 0) / 100;

              const newPlanPrice = Number(priceObj?.unit_amount || 0) / 100;

              const isDowngrade =
                !!currentSubscription?.planId &&
                newPlanPrice < currentPlanPrice;

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
                      left={4}
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

                  {/* Current Plan badge at top-right (only if signed in) */}
                  {isCurrentPlan && (
                    <Badge
                      position="absolute"
                      top={4}
                      right={4}
                      bg="#38A169"
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
                      <VStack align="start" spacing={0}>
                        {coupon && (
                          <Text
                            textDecoration="line-through"
                            color="gray.500"
                            fontSize="lg"
                          >
                            ${originalPrice}
                          </Text>
                        )}

                        <Text
                          fontSize={{ base: "3xl", md: "4xl" }}
                          fontWeight={900}
                          color={accentGold}
                        >
                          ${amount}
                        </Text>
                      </VStack>
                      <Text color="gray.500" fontSize="sm">
                        CAD
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
                          k.startsWith("feature_"),
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
                                nk.includes(canonNorm) ||
                                canonNorm.includes(nk),
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
                          bg="gray.900"
                          color="white"
                          border={`2px solid ${accentGold}`}
                          onClick={() =>
                            history.push("/login?redirect=/pricing")
                          }
                          _hover={{
                            bg: "black", // or darker color
                            color: "white", // ensure text stays white
                            transform: "translateY(-2px)",
                          }}
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
                            onClick={() => {
                              if (coupon?.type === "free_plan") {
                                activateGiftPlan(plan);
                              } else {
                                handleCheckout(
                                  projectAuth.currentUser,
                                  priceObj?.id,
                                  plan.id,
                                  amount,
                                  coupon,
                                );
                              }
                            }}
                            isLoading={loadingPlan === plan.id}
                          >
                            {loadingPlan === plan.id
                              ? "Redirecting..."
                              : isCurrentPlan
                                ? "Current Plan"
                                : isDowngrade
                                  ? "Not Available"
                                  : currentSubscription
                                    ? "Upgrade"
                                    : plan.metadata?.cta_text || "Choose"}
                          </Button>
                        </Tooltip>
                      )}
                    </HStack>
                  </VStack>
                </Box>
              );
            })}
          </Stack>

          <Text fontSize="sm" color="gray.500" mt={6} textAlign="center">
            Prices shown in CAD. All plans include secure storage and
            downloadable albums for every event.
          </Text>
        </Flex>
      </Box>
    </>
  );
}
