import { ReactNode } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { useCollection } from "../hooks/useCollection";
import PricingPlans from "./PricingPlans";

export default function Pricing() {
  //   const { documents, error } = useCollection(
  //     "plans",
  //     [],
  //     ["Pricing", "asc"]
  //   );
  const { documents, error } = useCollection("plans");
  
  return (
    <Box py={12}>
      <VStack spacing={2} textAlign="center">
        <Heading as="h1" fontSize="4xl">
          GUESTCAM
        </Heading>
        <Heading as="h1" fontSize="3xl">
          Plans that fit your need
        </Heading>
        {/* <Text fontSize="lg" color={"gray.500"}>
          Start with 14-day free trial. No credit card needed. Cancel at
          anytime.
        </Text> */}
      </VStack>
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}
      {documents && <PricingPlans plans={documents} />}
    </Box>
  );
}
