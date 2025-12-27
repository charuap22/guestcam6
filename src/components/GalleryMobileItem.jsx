import React from "react";
import { Box, Checkbox } from "@chakra-ui/react";
import useLongPress from "../hooks/useLongPress";

export default function GalleryMobileItem({
  img,
  user,
  index,
  tileBg,
  tileShadow,
  selectMode,
  selected,
  toggleSelect,
  setSelectMode,
  setViewerIndex,
  setViewerOpen,
    getUploaderName,
  timeAgo 
}) {
  const bind = useLongPress(() => {
    setSelectMode(true);
    toggleSelect(img.id);
  }, 350);

  return (
    <Box
      {...bind}
      bg={tileBg}
      borderRadius="12px"
      overflow="hidden"
      boxShadow={tileShadow}
      position="relative"
      cursor="pointer"
      onClick={(e) => {
        // 🔥 CRITICAL FIX
        if (selectMode) {
          e.preventDefault();
          e.stopPropagation();
          toggleSelect(img.id);
          return;
        }

        // normal mode only
        setViewerIndex(index);
        setViewerOpen(true);
      }}
    >
      {/* ✅ Checkbox ALWAYS visible in select mode */}
      {selectMode && (
        <Checkbox
          position="absolute"
          top={2}
          left={2}
          zIndex={10}
          size="md"
          bg="white"
          borderRadius="md"
          isChecked={selected.has(img.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleSelect(img.id);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Square thumbnail */}
      <Box position="relative" w="100%" pt="100%">
        <Box
          as="img"
          src={img.url}
          alt=""
          loading="lazy"
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          objectFit="cover"
        />
      </Box>
      <Box
        position="absolute"
        bottom={2}
        left={2}
        bg="rgba(0,0,0,0.55)"
        color="white"
        px={2}
        py={0.5}
        borderRadius="full"
        fontSize="xs"
        zIndex={5}
      >
        {getUploaderName(img, user)} • {timeAgo(img.createdAt)}
      </Box>
    </Box>
  );
}
