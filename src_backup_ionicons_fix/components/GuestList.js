import {
  useDisclosure,
  Button,
  Slide,
  Box,
  HStack,
  Flex,
  Spacer,
  Heading,
  VStack,
  StackDivider,
  Avatar,
  AvatarBadge,
  Text,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

import { useCollection } from "../hooks/useCollection";

const GuestList = () => {
  const { error, documents } = useCollection("users");
 
  return (
    <>
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}
      <br></br>
      {documents &&
        documents.map((doc) => (
           
            <HStack mb="20px" key={doc.id}>
              <Avatar size="md" name={doc.displayName} src={doc.photoURL}>
                <AvatarBadge
                  boxSize="1.25em"
                  bg={doc.online ? "green.500" : "tomato"}
                />
              </Avatar>
              <Text fontSize="md" color="gray.600">
                {doc.displayName}
              </Text>
            </HStack>
          
          // <VStack
          //   key={doc.uid}
          //   // divider={<StackDivider borderColor="gray.200" />}
          //   spacing={4}
          //   align="stretch"
          //   mt="20px"
          //   pb="200px"
          //   overflow="scroll"
          //   height="100%"
          // >
          //   <HStack>
          //     <Avatar size="md" name={doc.displayName} src={doc.photoUrl}>
          //       <AvatarBadge
          //         boxSize="1.25em"
          //         bg={doc.online ? "green.500" : "tomato"}
          //       />
          //     </Avatar>
          //     <Text fontSize="md" color="gray.600">
          //       {doc.displayName}
          //     </Text>
          //   </HStack>
          // </VStack>
        ))}
    </>
  );
};

export default GuestList;
