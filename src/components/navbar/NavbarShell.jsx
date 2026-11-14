import { Box, Flex, useColorModeValue } from "@chakra-ui/react";

export default function NavbarShell({ children }) {
  return (
    <Box
      position="fixed"
      top={{ base: "12px", md: "16px" }}
      left={{ base: "50%", md: "30px" }}
      transform={{ base: "translateX(-50%)", md: "none" }}
      w={{ base: "auto", md: "calc(100% - 60px)" }}
      maxW={{ base: "560px", md: "none" }}
      minH="75px"
      bg={useColorModeValue("rgba(244,247,254,0.2)", "rgba(11,20,55,0.5)")}
      borderRadius="16px"
      p={{ base: "10px 14px", md: "8px" }}
      zIndex="overlay"
    >
      <Flex w="100%" align="center" justify="space-between" gap={4}>
        {children}
      </Flex>
    </Box>
  );
}
