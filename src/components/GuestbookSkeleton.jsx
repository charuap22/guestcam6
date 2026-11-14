// src/components/GuestbookSkeleton.jsx
import {
  VStack,
  HStack,
  Box,
  Skeleton,
  SkeletonCircle,
  AspectRatio,
} from "@chakra-ui/react";

export default function GuestbookSkeleton({ count = 6 }) {
  return (
    <VStack spacing={5} align="stretch">
      {Array.from({ length: count }).map((_, i) => {
        const isOwner = i % 2 === 0;

        return (
          <HStack
            key={i}
            justify={isOwner ? "flex-end" : "flex-start"}
            align="flex-end"
            spacing={3}
          >
            {!isOwner && <SkeletonCircle size="9" />}

            {/* MESSAGE BUBBLE */}
            <Box
              maxW="70%"
              bg={isOwner ? "yellow.100" : "white"}
              borderRadius="lg"
              p={3}
              boxShadow="sm"
            >
              {/* Randomly show text or video skeleton */}
              {i % 3 === 0 ? (
                <AspectRatio ratio={9 / 16} w="200px">
                  <Skeleton borderRadius="md" />
                </AspectRatio>
              ) : (
                <>
                  <Skeleton h="12px" mb={2} />
                  <Skeleton h="12px" w="80%" />
                </>
              )}

              {/* timestamp */}
              <Skeleton mt={2} h="8px" w="40px" />
            </Box>

            {isOwner && <SkeletonCircle size="9" />}
          </HStack>
        );
      })}
    </VStack>
  );
}
