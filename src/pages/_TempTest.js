// src/pages/_TempTest.js
import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function TempTest() {
  return (
    <Box p={8} bg="white" rounded="lg" boxShadow="md">
      <Heading size="lg" mb={3}>
        Temp Test Page
      </Heading>
      <Text>
        This is a simple test - the admin layout is rendering pages correctly.
      </Text>
    </Box>
  );
}
