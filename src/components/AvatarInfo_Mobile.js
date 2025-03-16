import React from "react";
import { HStack, Center, Avatar, Text, VStack } from "@chakra-ui/react";
import { useAuthContext } from "../hooks/useAuthContext";

export const AvatarInfo_Mobile = () => {
  const { user } = useAuthContext();

  return (
    <>
      {user && (
        <HStack alignContent={"right"}>
          <Avatar size={"sm"} name={user.displayName} src={user.photoURL} />

          <VStack alignItems="flex-start" spacing="1px" marginTop={"10px"}>
            <Text fontSize="sm" marginBottom={0}>{user.displayName}</Text>
            <Text fontSize="xs" color="gray.600">
              {user.email}
            </Text>
          </VStack>
        </HStack>
      )}
    </>
  );
};
