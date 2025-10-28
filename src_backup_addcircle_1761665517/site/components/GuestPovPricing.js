import React from "react";
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
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";

export default function GuestPovPricing() {
  // Light/dark support
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const accentGold = "#C5A572"; // warm gold tone
  const borderGold = "rgba(197, 165, 114, 0.4)";
  const textGold = "#B89152";

  const plans = [
    {
      id: "lite",
      name: "Lite",
      price: "$75",
      currency: "CAD",
      highlight: false,
      features: [
        "Single Gallery",
        "Main Gallery",
        "Default Design Themes",
        "6 Month Upload & 12 Month Download Window",
      ],
      cta: "Choose Lite",
    },
    {
      id: "flex",
      name: "Flex",
      price: "$125",
      currency: "CAD",
      highlight: true,
      features: [
        "Includes Albums",
        "Main Gallery + 3 Events (Albums)",
        "Choice of 20 Design Themes",
        "12 Month Upload & 12 Month Download Window",
      ],
      cta: "Choose Flex",
    },
    {
      id: "max",
      name: "Max",
      price: "$165",
      currency: "CAD",
      highlight: false,
      features: [
        "Multi-Day Events",
        "Main Gallery + 6 Events (Albums)",
        "Customizable Themes",
        "12 Month Upload & 12 Month Download Window",
      ],
      cta: "Choose Max",
    },
  ];

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
          <Heading
            as="h2"
            size="xl"
            lineHeight={1.05}
            color={useColorModeValue("gray.800", "gray.100")}
          >
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
          {plans.map((plan) => (
            <Box
              key={plan.id}
              bg={cardBg}
              borderRadius="20px"
              boxShadow={
                plan.highlight
                  ? "0 25px 40px rgba(0,0,0,0.1)"
                  : "0 10px 25px rgba(0,0,0,0.05)"
              }
              border={
                plan.highlight
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
              {plan.highlight && (
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

              <VStack align="start" spacing={5}>
                <Heading
                  as="h3"
                  fontSize={{ base: "2xl", md: "3xl" }}
                  color={plan.highlight ? textGold : "gray.800"}
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
                    {plan.price}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    {plan.currency}
                  </Text>
                </HStack>

                <Text
                  color="gray.600"
                  fontSize="sm"
                  fontWeight="500"
                  letterSpacing="0.02em"
                >
                  {plan.name === "Lite"
                    ? "Perfect for one special event."
                    : plan.name === "Flex"
                    ? "Most popular choice for weddings and family events."
                    : "For multi-day, large-scale celebrations."}
                </Text>

                <UnorderedList spacing={3} pl={4} styleType="none">
                  {plan.features.map((feature, idx) => (
                    <ListItem
                      key={idx}
                      display="flex"
                      alignItems="center"
                      gap={3}
                    >
                      <Icon as={CheckIcon} color={accentGold} boxSize={4} />
                      <Text color="gray.700" fontSize="sm">
                        {feature}
                      </Text>
                    </ListItem>
                  ))}
                </UnorderedList>

                <Button
                  mt={3}
                  size="lg"
                  width="full"
                  borderRadius="full"
                  bg={plan.highlight ? accentGold : "transparent"}
                  color={plan.highlight ? "white" : accentGold}
                  border={`2px solid ${accentGold}`}
                  _hover={{
                    bg: plan.highlight ? "#b89350" : accentGold,
                    color: "white",
                  }}
                  transition="all 0.3s ease"
                >
                  {plan.cta}
                </Button>
              </VStack>
            </Box>
          ))}
        </Stack>

        <Text fontSize="sm" color="gray.500" mt={6} textAlign="center">
          Prices shown in CAD. All plans include secure storage and downloadable
          albums for every event.
        </Text>
      </Flex>
    </Box>
  );
}
