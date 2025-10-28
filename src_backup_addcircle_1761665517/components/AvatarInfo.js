import React from "react";
import { VStack, Center, Avatar, Text } from "@chakra-ui/react";
import { useAuthContext } from "../hooks/useAuthContext";

export const AvatarInfo = () => {
  const { user } = useAuthContext();

  return (
    <>
      {user && (
        <VStack>
          <Center>
            <Avatar size="xl" name={user.displayName} src={user.photoURL} />
          </Center>
          <br />
          <Center>
            <Text fontWeight="bold">{user.displayName}</Text>
          </Center>
          <Text color="rgb(148, 163, 184)">{user.email}</Text>
        </VStack>
      )}
    </>
  );
};
