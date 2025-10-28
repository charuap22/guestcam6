// components/ImageCardSkeleton.js
import React from "react";
import { Box, Skeleton, SkeletonText } from "@chakra-ui/react";

const ImageCardSkeleton = () => {
  return (
    <Box borderRadius="lg" overflow="hidden" boxShadow="md" bg="gray.100">
      <Skeleton height="220px" w="100%" />
      <Box p={3}>
        <SkeletonText noOfLines={2} spacing={3} />
      </Box>
    </Box>
  );
};

export default ImageCardSkeleton;
