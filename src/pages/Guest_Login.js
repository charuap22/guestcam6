import { useParams } from "react-router-dom";
import { useDocument } from "../hooks/useDocument";
import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Container,
  Input,
  Button,
  SimpleGrid,
  Avatar,
  AvatarGroup,
  useBreakpointValue,
  IconProps,
  Icon,
  AvatarBadge,
  Image,
  IconButton,
  Alert,
  AlertIcon,
  AlertDescription,
  VStack,
  Spacer,
  FormControl,
  FormLabel,
  Checkbox,
  HStack,
} from "@chakra-ui/react";
import background from "../assets/party_slide2.jpeg";
import { AddCircleIcon } from "chakra-ui-ionicons";
import { useState, useRef, useEffect } from "react";

import { NavLink } from "react-router-dom";

import { useSignup } from "../hooks/useSignup";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Resizer from "react-image-file-resizer";
import { useSignup_Guest } from "../hooks/useSignup_Guest";
import { useEvent } from "../hooks/useEvent";

const avatars = [
  {
    name: "Ryan Florence",
    url: "https://bit.ly/ryan-florence",
  },
  {
    name: "Segun Adebayo",
    url: "https://bit.ly/sage-adebayo",
  },
  {
    name: "Kent Dodds",
    url: "https://bit.ly/kent-c-dodds",
  },
  {
    name: "Prosper Otemuyiwa",
    url: "https://bit.ly/prosper-baba",
  },
  {
    name: "Christian Nwamba",
    url: "https://bit.ly/code-beast",
  },
];

export default function Guest_Login() {
  const [displayName, setDisplayName] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailError, setThumbnailError] = useState(null);
  const [avatarImg, setAvatarImg] = useState(null);

  const { signup, isPending, error } = useSignup_Guest();

  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        250,
        250,
        "JPEG",
        100,
        0,
        (uri) => {
          resolve(uri);
        },
        "file"
      );
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(displayName, thumbnail, id);
  };
  // Create a reference to the hidden file input element
  const hiddenFileInput = useRef(null);

  // Programatically click the hidden file input element
  // when the Button component is clicked
  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };

  // Call a function (passed as a prop from the parent component)
  // to handle the user-selected file
  const handleFileChange = async (e) => {
    setThumbnail(null);
    let selected = e.target.files[0];
    console.log(selected);

    if (!selected) {
      setThumbnailError("Please select a file");
      return;
    }
    if (!selected.type.includes("image")) {
      setThumbnailError("Selected file must be an image");
      return;
    }
    if (selected.size > 2000000) {
      setThumbnailError("Image file size must be less than 2mb");
      return;
    }
    try {
      const file = selected;
      const resizedImage = await resizeFile(file);
      console.log("selected", selected);
      console.log("resized", resizedImage);
      setAvatarImg(URL.createObjectURL(resizedImage));
      setThumbnailError(null);
      setThumbnail(resizedImage);

      console.log("thumbnail updated");
    } catch (err) {
      setThumbnailError(err);
      return;
    }

    //props.handleFile(fileUploaded);
  };

  const { id } = useParams();
  const { document, error2 } = useDocument("events", id);
  const { eventId, changeEvent } = useEvent();
  useEffect(() => {
    changeEvent(id);
  }, []);
  if (error2) {
    return <div className="error">{error}</div>;
  }
  if (!document) {
    return <div className="loading">Loading...</div>;
  }
  return (
    <>
      <Stack minH={"100vh"} direction={{ base: "column", md: "row" }}>
        <Flex p={8} flex={1} align={"center"} justify={"center"}>
          <Stack spacing={4} w={"full"} maxW={"md"}>
            <Heading
              align={"center"}
              lineHeight={1.1}
              fontSize={{ base: "xl", sm: "xl", md: "xl", lg: "2xl" }}
            >
              {document.eventPageHeader}
            </Heading>
            <Spacer></Spacer>

            {/* <Heading fontSize={"2xl"}>{document.eventPageHeader}</Heading> */}
            <Text align={"center"} paddingBottom="20px">
              {document.welcomeMessage}
            </Text>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                {thumbnailError && (
                  <Alert status="error">
                    <AlertIcon />
                    {thumbnailError}
                  </Alert>
                )}
                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
                {/* <FormControl id="email">
                <FormLabel>Email address</FormLabel>
                <Input
                  required
                  type="email"
                  bg={"gray.100"}
                  border={0}
                  color={"gray.500"}
                  _placeholder={{
                    color: "gray.500",
                  }}
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </FormControl>
              <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <Input
                  required
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  bg={"gray.100"}
                  border={0}
                  color={"gray.500"}
                  _placeholder={{
                    color: "gray.500",
                  }}
                />
              </FormControl> */}

                <HStack>
                  <Box>
                    {" "}
                    <Avatar
                      width="100px"
                      height="100px"
                      size="xl"
                      border="5px solid #EFEDFF"
                      bg="gray.500"
                      src={avatarImg}
                    >
                      <AvatarBadge
                        cursor="pointer"
                        borderColor="yellow.200"
                        bgColor="yellow.100"
                        onClick={handleClick}
                      >
                        {/* <BiPencil color="black" fontSize="20px" /> */}
                        {/* <Image src="https://raw.githubusercontent.com/chakra-ui/chakra-ui/develop/logo/logomark-colored%402x.png" /> */}
                        <AddCircleIcon w={8} h={8} color="yellow.500" />
                      </AvatarBadge>
                    </Avatar>
                    <Input
                      type="file"
                      ref={hiddenFileInput}
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </Box>
                  <Spacer></Spacer>
                  <Box>
                    <FormControl id="displayName" width={"300px"}>
                      <FormLabel>Display Name</FormLabel>
                      <Input
                        required
                        type="text"
                        onChange={(e) => setDisplayName(e.target.value)}
                        value={displayName}
                        bg={"gray.100"}
                        border={0}
                        color={"gray.500"}
                        _placeholder={{
                          color: "gray.500",
                        }}
                        width={{
                          base: "200px",
                          sm: "200px",
                          md: "100%", 
                          lg: "100%",
                        }}
                      />
                    </FormControl>
                  </Box>
                </HStack>

                <Button
                  type="submit"
                  fontFamily={"heading"}
                  mt={8}
                  w={"full"}
                  bgGradient="linear(to-r, #000, yellow.500)"
                  color={"white"}
                  _hover={{
                    bgGradient: "linear(to-r, #000, yellow.500)",
                    boxShadow: "xl",
                  }}
                >
                  {!isPending && "Continue >"}
                  {isPending && "Loading..."}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Flex>
        <Flex
          flex={1}
          backgroundImage={`url(${document.featureImage})`}
          backgroundSize={["cover", "cover", "cover", "cover"]}
          background-repeat="no-repeat"
          backgroundPosition="center"
          p={8}
        ></Flex>
      </Stack>
      <Spacer></Spacer>
    </>

    // /////////////////////
  );
}
