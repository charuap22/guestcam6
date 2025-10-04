import React from "react";
import {
  Box,
  Text,
  Spinner,
  Skeleton,
  VStack,
  Alert,
  AlertIcon,
  Flex,
  Icon,Badge,
  HStack
} from "@chakra-ui/react";
import { FaCrown } from "react-icons/fa";
import { usePlan } from "../context/PlanContext";

const GetPackageInfo = () => {
  const { currentPlan, loading } = usePlan();

  
    return (
      <Box textAlign="center" p={4} borderRadius="lg">
        {loading ? (
          <VStack spacing={3}>
            <Skeleton height="20px" width="60%" />
            <Skeleton height="16px" width="40%" />
          </VStack>
        ) : currentPlan ? (
          <Box
            bg="white"
            p={3}
            rounded="md"
            minW="200px"
            maxW="420px"
            textAlign="center"
          >
            <HStack spacing={3} flexWrap="wrap">
              <Icon as={FaCrown} w={8} h={8} color="yellow.500" />
              <Text
                fontSize={{ base: "md", md: "lg", lg: "xl" }}
                fontWeight="bold"
                color="gray.800"
                pt={4}
              >
                {currentPlan.planName}
              </Text>
              <Badge
                colorScheme="yellow"
                fontSize="1em"
                px={3}
                py={1}
                rounded="full"
              >
                {currentPlan.guestStart} - {currentPlan.guestEnd} Guests
              </Badge>
            </HStack>
          </Box>
        ) : (
          <Text fontSize="lg" fontWeight="bold" color="red.500">
            No active package found.
          </Text>
        )}
      </Box>
    );
};

export default GetPackageInfo;
