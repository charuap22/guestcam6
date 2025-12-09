// src/pages/Signup.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Avatar,
  AvatarBadge,
  VStack,
  Spacer,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  AvatarGroup,
  useBreakpointValue,
} from "@chakra-ui/react";
import background from "../assets/party_slide2.jpeg";
import { IoAddCircleOutline } from "react-icons/io5";
import { useLocation, useHistory, NavLink } from "react-router-dom";
import { useSignup } from "../hooks/useSignup";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Resizer from "react-image-file-resizer";

const avatars = [
  { name: "Ryan Florence", url: "https://bit.ly/ryan-florence" },
  { name: "Segun Adebayo", url: "https://bit.ly/sage-adebayo" },
  { name: "Kent Dodds", url: "https://bit.ly/kent-c-dodds" },
  { name: "Prosper Otemuyiwa", url: "https://bit.ly/prosper-baba" },
  { name: "Christian Nwamba", url: "https://bit.ly/code-beast" },
];

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailError, setThumbnailError] = useState(null);
  const [avatarImg, setAvatarImg] = useState(null);

  const { signup, isPending, error } = useSignup();

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

  const hiddenFileInput = useRef(null);
  const handleClick = () => hiddenFileInput.current?.click();

  const location = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(location.search);
  // default redirect after signup -> /pricing
  const redirectTo = params.get("redirect") || "/pricing";

  const handleFileChange = async (e) => {
    setThumbnail(null);
    let selected = e.target.files && e.target.files[0];

    if (!selected) {
      setThumbnailError("Please select a file");
      return;
    }
    if (!selected.type.includes("image")) {
      setThumbnailError("Selected file must be an image");
      return;
    }
    if (selected.size > 2_000_000) {
      setThumbnailError("Image file size must be less than 2mb");
      return;
    }
    try {
      const resizedImage = await resizeFile(selected);
      setAvatarImg(URL.createObjectURL(resizedImage));
      setThumbnailError(null);
      setThumbnail(resizedImage);
    } catch (err) {
      setThumbnailError("Failed to resize image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // signup should throw on error or return a resolved promise on success
      await signup(email, password, displayName, thumbnail);
      // redirect after successful signup
      history.replace(redirectTo);
    } catch (err) {
      toast.error(err?.message || "Signup failed. Please try again.");
      // signup hook may also set `error`, which you are already rendering below
    }
  };

  return (
    <>
      <Button
            position="absolute"
            top="20px"
            left="20px"
            zIndex={10}
            size="sm"
            bg="whiteAlpha.800"
            backdropFilter="blur(6px)"
            color="black"
            borderRadius="full"
            px={4}
            onClick={() => history.push("/")}
            _hover={{ bg: "white" }}
          >
            ← Back
          </Button>
      <Stack minH={"100vh"} direction={{ base: "column", md: "row" }}>
        <Flex p={8} flex={1} align={"center"} justify={"center"}>
          <Stack spacing={4} w={"full"} maxW={"md"}>
            <Heading fontSize={"2xl"}>Sign up</Heading>
            <Text paddingBottom="20px">
              Already have an account?{" "}
              <NavLink to={`/login?redirect=${encodeURIComponent(redirectTo)}`}>
                Login
              </NavLink>
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

                <FormControl id="email">
                  <FormLabel>Email address</FormLabel>
                  <Input
                    required
                    type="email"
                    bg={"gray.100"}
                    border={0}
                    color={"gray.500"}
                    _placeholder={{ color: "gray.500" }}
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
                    _placeholder={{ color: "gray.500" }}
                  />
                </FormControl>

                <FormControl id="displayName">
                  <FormLabel>Display Name</FormLabel>
                  <Input
                    required
                    type="text"
                    onChange={(e) => setDisplayName(e.target.value)}
                    value={displayName}
                    bg={"gray.100"}
                    border={0}
                    color={"gray.500"}
                    _placeholder={{ color: "gray.500" }}
                  />
                </FormControl>

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
                    <IoAddCircleOutline w={8} h={8} color="yellow.500" />
                  </AvatarBadge>
                </Avatar>

                <Input
                  type="file"
                  ref={hiddenFileInput}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />

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
                  isLoading={isPending}
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
          backgroundImage={`url(${background})`}
          backgroundSize="cover"
          backgroundPosition="center"
          p={8}
        >
          <Flex flexDirection="column">
            <Heading
              color="white"
              lineHeight={1.1}
              fontSize={{ base: "xl", lg: "2xl" }}
            >
              GUESTPOV
            </Heading>
            <Spacer />
            <VStack align="stretch" spacing={8}>
              <Heading
                color="white"
                lineHeight={1.1}
                fontSize={{
                  base: "xl",
                  sm: "2xl",
                  md: "3xl",
                  lg: "3xl",
                  "2xl": "4xl",
                }}
              >
                Share all the photos & videos taken by you and your guests on a
                LIVE Photo Wall.
              </Heading>
              <Text
                fontSize={{ base: "s", sm: "m", md: "l", lg: "xl", xl: "xl" }}
                color="white"
              >
                Create an account and discover the worlds' best photo sharing
                experience.
              </Text>

              <Stack direction={"row"} spacing={4} align={"center"}>
                <AvatarGroup>
                  {avatars.map((a) => (
                    <Avatar
                      key={a.name}
                      name={a.name}
                      src={a.url}
                      position={"relative"}
                      zIndex={2}
                      _before={{
                        content: '""',
                        width: "full",
                        height: "full",
                        rounded: "full",
                        transform: "scale(1.125)",
                        bgGradient: "linear(to-bl, #000, yellow.500)",
                        position: "absolute",
                        zIndex: -1,
                        top: 0,
                        left: 0,
                      }}
                    />
                  ))}
                </AvatarGroup>

                <Text
                  fontFamily={"heading"}
                  color="white"
                  fontSize={{ base: "4xl", md: "6xl" }}
                >
                  +
                </Text>

                <Flex
                  align={"center"}
                  justify={"center"}
                  fontFamily={"heading"}
                  fontSize={{ base: "sm", md: "lg" }}
                  bg={"gray.800"}
                  color={"white"}
                  rounded={"full"}
                  minWidth={useBreakpointValue({ base: "44px", md: "60px" })}
                  minHeight={useBreakpointValue({ base: "44px", md: "60px" })}
                  position={"relative"}
                  _before={{
                    content: '""',
                    width: "full",
                    height: "full",
                    rounded: "full",
                    transform: "scale(1.125)",
                    bgGradient: "linear(to-bl, orange.400,yellow.400)",
                    position: "absolute",
                    zIndex: -1,
                    top: 0,
                    left: 0,
                  }}
                >
                  YOU
                </Flex>
              </Stack>
            </VStack>
            <Spacer />
            <Box>
              <Text color="white">© 2022 Chakra UI. All rights reserved.</Text>
            </Box>
          </Flex>
        </Flex>
      </Stack>

      <ToastContainer />
    </>
  );
}
