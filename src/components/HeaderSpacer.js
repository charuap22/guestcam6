import { Box } from "@chakra-ui/react";

export default function HeaderSpacer() {
  return (
    <Box
      // ✅ Height adjusted to perfectly clear your dashboard header
      h={{
        base: "calc(env(safe-area-inset-top, 0px) + 170px)", // for iPhones / mobile
        md: "130px", // for desktop/tablet
      }}
      flexShrink={0}
    />
  );
}
