// src/components/sidebar/components/Content.js
import React from "react";
import { Box, Flex, Stack, useBreakpointValue } from "@chakra-ui/react";

// NOTE: these paths assume these files are in the same folder as Content.js
import Brand from "./Brand";
import SidebarLinks from "./Links";

// from src/components/sidebar/components -> go up 3 levels to src, then hooks
import { useAuthContext } from "../../../hooks/useAuthContext";
import { useDocument } from "../../../hooks/useDocument";

function SidebarContent(props) {
  const { routes } = props;

  const { user } = useAuthContext();
  const { document: userDoc } = useDocument("users", user?.uid);

  const isDesktop = useBreakpointValue({ base: false, xl: true });
  const canSeeSidebar = (!!user && !userDoc?.isGuest) || !!userDoc?.package;
  const showSidebar = Boolean(isDesktop && canSeeSidebar);

  if (!showSidebar) return null;

  return (
    <Flex
      direction="column"
      height="100%"
      pt="25px"
      px="16px"
      borderRadius="30px"
    >
      <Brand />
      <Stack direction="column" mb="auto" mt="8px">
        <Box ps="20px" pe={{ md: "16px", "2xl": "1px" }}>
          <SidebarLinks routes={routes} />
        </Box>
      </Stack>
    </Flex>
  );
}

export default SidebarContent;
