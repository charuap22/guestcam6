import React, { useEffect, useState } from "react";
import {
  Box,
  chakra,
  Flex,
  useColorModeValue,
  Button,
  Stack,
  Textarea,
} from "@chakra-ui/react";

import { useAuthContext } from "../hooks/useAuthContext";
import { timestamp } from "../firebase/config";

import { v4 as uuidv4 } from "uuid";

import { useParams } from "react-router-dom";
import { useDocument } from "../hooks/useDocument";
import { useFirestore } from "../hooks/useFirestore";
import Comments from "../components/Comments";
const Guestbook = () => {
  const { id } = useParams();
  const { error, document } = useDocument("events", id);
  const { updateDocument, response } = useFirestore("events");

  const [newComment, setNewComment] = useState("");
  const { user } = useAuthContext();
  const [guestbook, setGuestBook] = useState([]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const commentToAdd = {
      displayName: user.displayName,
      photoURL: user.photoURL,
      content: newComment,
      createdAt: timestamp.fromDate(new Date()),
      id: uuidv4(),
    };
    await updateDocument(document.id, {
      guestBook: [...document.guestBook, commentToAdd],
    });

    if (!response.error) {
      setNewComment("");
    }
  };

//   useEffect(() => {
//     if (document) {
//       const gb = document.guestBook;
//       gb.sort(function (a, b) {
//         // Turn your strings into dates, and then subtract them
//         // to get a value that is either negative, positive, or zero.
//         return new Date(b.createdAt) - new Date(a.createdAt);
//       });
//       setGuestBook(gb);
//     }
//   }, []);
  if (!document) {
    return <div className="loading">Loading...</div>;
  }
  return (
    <>
      <Flex
        textAlign={"center"}
        pt={10}
        justifyContent={"center"}
        direction={"column"}
        width={"full"}
        overflow={"hidden"}
      >
        <Box width={{ base: "full", sm: "lg", lg: "xl" }} margin={"auto"}>
          <chakra.h3
            fontFamily={"Work Sans"}
            fontWeight={"bold"}
            fontSize={20}
            textTransform={"uppercase"}
            color={"purple.400"}
          >
            {document.eventName}
          </chakra.h3>
          <chakra.h1
            py={5}
            fontSize={38}
            fontFamily={"Work Sans"}
            fontWeight={"bold"}
            color={"gray.700"}
          >
            GuestBook
          </chakra.h1>
          
        </Box>
        <Comments comments={document.guestBook}></Comments>
        {/* <Box>
        <Icon viewBox="0 0 40 35" mt={14} boxSize={10} color={"purple.400"}>
          <path
            fill={"currentColor"}
            d="M10.7964 5.04553e-07C8.66112 -0.000123335 6.57374 0.632971 4.79827 1.81922C3.0228 3.00547 1.63898 4.69158 0.82182 6.66433C0.00466116 8.63708 -0.209132 10.8079 0.207477 12.9021C0.624087 14.9964 1.65239 16.9201 3.16233 18.4299L19.1153 34.3828C19.2395 34.5074 19.3871 34.6062 19.5496 34.6736C19.7121 34.741 19.8863 34.7757 20.0622 34.7757C20.2381 34.7757 20.4123 34.741 20.5748 34.6736C20.7373 34.6062 20.8848 34.5074 21.0091 34.3828L36.962 18.4272C38.9319 16.3917 40.0228 13.6636 39.9996 10.8311C39.9764 7.99858 38.8409 5.28867 36.838 3.28573C34.835 1.28279 32.1251 0.147283 29.2926 0.124081C26.4601 0.100879 23.732 1.19184 21.6965 3.1617L20.0622 4.79337L18.4305 3.1617C17.4276 2.15892 16.237 1.36356 14.9267 0.821064C13.6163 0.278568 12.2119 -0.000433066 10.7937 5.04553e-07H10.7964Z"
          />
        </Icon>
      </Box> */}
      </Flex>
      <Flex align={"center"} justify={"center"} bg={"gray.50"}>
        <Stack spacing={8} mx={"auto"} py={12} px={6} width={"100%"}>
          {/* footer */}
          <form onSubmit={handleSendMessage}>
            <Flex w="100%" mt="5">
              <Textarea
                required
                placeholder="Type Something..."
                border="none"
                borderRadius="none"
                _focus={{
                  border: "1px solid black",
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button
                bg="black"
                color="white"
                borderRadius="none"
                _hover={{
                  bg: "white",
                  color: "black",
                  border: "1px solid black",
                }}
                disabled={newComment.trim().length <= 0}
                ml={2}
                mt={0}
                pt={2}
                pb={2}
                width={"150px"}
                height={"80px"}
                onClick={handleSendMessage}
              >
                Send<br></br>Message
              </Button>
            </Flex>
          </form>
        </Stack>
      </Flex>
    </>
  );
};

export default Guestbook;
