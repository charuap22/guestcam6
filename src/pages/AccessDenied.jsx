// src/pages/AccessDenied.jsx
import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";

export default function AccessDenied() {
  const history = useHistory();
  const bg = useColorModeValue("white", "gray.800");
  const sub = useColorModeValue("gray.600", "gray.300");

  return (
    <Flex minH="60vh" align="center" justify="center" bg={bg} p={6}>
      <Box
        maxW="700px"
        w="full"
        borderRadius="12px"
        boxShadow="lg"
        p={{ base: 6, md: 10 }}
        textAlign="center"
      >
        <Heading size="lg" mb={4}>
          Access Denied
        </Heading>
        <Text color={sub} mb={6}>
          You don't have permission to view this page. If you believe this is a
          mistake, sign in with the account that created the event or contact
          the event owner for access.
        </Text>

        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={3}
          justify="center"
        >
          <Button
            onClick={() => history.push("/admin/dashboard")}
            variant="outline"
            colorScheme="gray"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => {
              if (window.history.length > 1) history.goBack();
              else history.push("/admin/dashboard");
            }}
            colorScheme="yellow"
            bg="#d4af37"
            _hover={{ bg: "#b58e0a" }}
          >
            Go Back
          </Button>
        </Stack>
      </Box>
    </Flex>
  );
}
