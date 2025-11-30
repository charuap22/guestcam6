// src/pages/Login.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Input,
  Button,
  Avatar,
  AvatarGroup,
  useBreakpointValue,
  VStack,
  Spacer,
  Link,
  FormControl,
  FormLabel,
  Checkbox,
  Alert,
  AlertIcon,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import background from "../assets/party_slide2.jpeg";
import { useLogin } from "../hooks/useLogin";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { NavLink } from "react-router-dom";

export default function Login() {
  // start with empty; hook will supply rememberedEmail if present
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    login,
    Googlelogin,
    Facebooklogin,
    resetPassword,
    isPending,
    resetPending,
    error,
    remember,
    setRemember,
    rememberedEmail,
    updateRemember,
  } = useLogin();

  const toast = useToast();

  // Initialize email from remembered email (if any)
  useEffect(() => {
    if (rememberedEmail) {
      setEmail(rememberedEmail);
    }
  }, [rememberedEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // persist or remove remembered email based on hook state
    updateRemember(email);

    try {
      await login(email, password);
      // login will handle navigation; nothing else needed here
    } catch (err) {
      // login errors are handled via hook's error state, but you may show toast too
      toast({
        title: "Login failed",
        description: err.message || "Unable to login",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleForgotPassword = async (e) => {
    e && e.preventDefault();
    if (!email) {
      toast({
        title: "Enter email",
        description: "Please enter your email in the email field first.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      await resetPassword(email);
      toast({
        title: "Password reset sent",
        description: `A password reset link was sent to ${email}. Check your inbox.`,
        status: "success",
        duration: 6000,
        isClosable: true,
      });
    } catch (err) {
      const msg =
        err?.code === "auth/user-not-found"
          ? "No user found with this email."
          : err?.message || "Could not send password reset email.";
      toast({
        title: "Error",
        description: msg,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    }
  };

  const avatars = [
    { name: "Ryan Florence", url: "https://bit.ly/ryan-florence" },
    { name: "Segun Adebayo", url: "https://bit.ly/sage-adebayo" },
    { name: "Kent Dodds", url: "https://bit.ly/kent-c-dodds" },
    { name: "Prosper Otemuyiwa", url: "https://bit.ly/prosper-baba" },
    { name: "Christian Nwamba", url: "https://bit.ly/code-beast" },
  ];

  return (
    <>
      <Stack minH={"100vh"} direction={{ base: "column", md: "row" }}>
        <Flex p={8} flex={1} align={"center"} justify={"center"}>
          <Stack spacing={4} w={"full"} maxW={"md"}>
            <Heading fontSize={"2xl"}>Sign in to your account</Heading>
            <Text paddingBottom="20px">
              Don't have an account? <NavLink to="/signup">Signup</NavLink>
            </Text>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
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
                    placeholder="Email"
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
                    placeholder="Password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    bg={"gray.100"}
                    border={0}
                    color={"gray.500"}
                    _placeholder={{ color: "gray.500" }}
                  />
                </FormControl>
                <Stack spacing={6}>
                  <Stack
                    direction={{ base: "column", sm: "row" }}
                    align={"start"}
                    justify={"space-between"}
                  >
                    <Checkbox
                      isChecked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    >
                      Remember me
                    </Checkbox>

                    <Link
                      color={"blue.500"}
                      onClick={handleForgotPassword}
                      cursor={resetPending ? "not-allowed" : "pointer"}
                      aria-disabled={resetPending}
                    >
                      {resetPending ? (
                        <span>
                          <Spinner size="xs" mr={2} />
                          Sending...
                        </span>
                      ) : (
                        "Forgot password?"
                      )}
                    </Link>
                  </Stack>
                </Stack>

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
                  Continue &gt;
                </Button>
              </Stack>
            </form>
          </Stack>
        </Flex>

        <Flex
          flex={1}
          backgroundImage={`url(${background})`}
          backgroundSize={["cover", "cover", "cover", "cover"]}
          backgroundPosition="center"
          p={8}
        >
          <Flex flexDirection="column">
            <Heading
              color="white"
              lineHeight={1.1}
              fontSize={{ base: "xl", sm: "xl", md: "xl", lg: "2xl" }}
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
                  {avatars.map((avatar) => (
                    <Avatar
                      key={avatar.name}
                      name={avatar.name}
                      src={avatar.url}
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
              <Text color="white">© 2023 GuestPOV. All rights reserved.</Text>
            </Box>
          </Flex>
        </Flex>
      </Stack>

      <ToastContainer />
    </>
  );
}
