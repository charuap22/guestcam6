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


import firebase from "firebase/app"; // ✅ ADD
import "firebase/firestore";  

import { useLocation, useHistory, NavLink } from "react-router-dom";
import background from "../assets/party_slide2.jpeg";
import { useLogin } from "../hooks/useLogin";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
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
  const location = useLocation();
  const history = useHistory();

  // Extract redirect path if exists: /login?redirect=/pricing
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/admin/dashboard";

  useEffect(() => {
    if (rememberedEmail) setEmail(rememberedEmail);
  }, [rememberedEmail]);

const handleSubmit = async (e) => {
  e.preventDefault();

  updateRemember(email);

  try {
    const userCredential = await login(email, password);
    const uid = userCredential?.user?.uid;

    // 🔹 Fetch user doc
    const userSnap = await firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .get();

    const userData = userSnap.exists ? userSnap.data() : null;

    // 🔹 Determine plan status
    const hasPlan =
      userData?.subscriptionStatus === "active" ||
      userData?.packageActive === true ||
      userData?.planId;

    // 🔹 Redirect logic
    if (!hasPlan) {
      history.replace("/pricing");
    } else {
      history.replace(redirectTo);
    }
  } catch (err) {
    toast({
      title: "Login failed",
      description: getAuthErrorMessage(err),
      status: "error",
      duration: 4000,
      isClosable: true,
      position: "top-center",
    });
  }

};


  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Enter email",
        description: "Please enter your email first.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      await resetPassword(email);
      toast({
        title: "Password reset email sent",
        description: `Check your inbox for instructions.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err?.message || "Could not send password reset email.",
        status: "error",
        duration: 5000,
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
const getAuthErrorMessage = (err) => {
  const code = err?.code || err?.message || "";

  if (code.includes("auth/user-not-found")) {
    return "No account found with this email.";
  }

  if (code.includes("auth/wrong-password")) {
    return "Incorrect password. Please try again.";
  }

  if (code.includes("auth/invalid-credential")) {
    return "Invalid email or password.";
  }

  if (code.includes("auth/too-many-requests")) {
    return "Too many attempts. Please try again later.";
  }

  return "Unable to login. Please try again.";
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

      <Stack minH="100vh" direction={{ base: "column", md: "row" }}>
        {/* LEFT SIDE: FORM */}
        <Flex p={8} flex={1} align="center" justify="center">
          <Stack spacing={4} w="full" maxW="md">
            <Heading fontSize="2xl">Sign in to your account</Heading>
            <Text pb="20px">
              Don't have an account?{" "}
              <NavLink to={`/signup?redirect=${redirectTo}`}>Signup</NavLink>
            </Text>

            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                

                <FormControl>
                  <FormLabel>Email address</FormLabel>
                  <Input
                    required
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="gray.100"
                    border={0}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Password</FormLabel>
                  <Input
                    required
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="gray.100"
                    border={0}
                  />
                </FormControl>

                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align="start"
                  justify="space-between"
                >
                  <Checkbox
                    isChecked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  >
                    Remember me
                  </Checkbox>

                  <Link
                    color="blue.500"
                    onClick={handleForgotPassword}
                    cursor={resetPending ? "not-allowed" : "pointer"}
                  >
                    {resetPending ? (
                      <span>
                        <Spinner size="xs" mr={2} /> Sending...
                      </span>
                    ) : (
                      "Forgot password?"
                    )}
                  </Link>
                </Stack>

                {/* LOGIN BUTTON */}
                <Button
                  type="submit"
                  mt={6}
                  w="full"
                  bg="black"
                  color="white"
                  borderRadius="full"
                  isLoading={isPending}
                  _hover={{
                    bg: "black",
                    color: "white",
                    boxShadow: "lg",
                  }}
                >
                  Continue &gt;
                </Button>

                {/* GOOGLE LOGIN */}
                {/* <Button
                  w="full"
                  variant="outline"
                  onClick={async () => {
                    await Googlelogin();
                    history.replace(redirectTo);
                  }}
                >
                  Continue with Google
                </Button> */}

                {/* FACEBOOK LOGIN */}
                {/* <Button
                  w="full"
                  variant="outline"
                  onClick={async () => {
                    await Facebooklogin();
                    history.replace(redirectTo);
                  }}
                >
                  Continue with Facebook
                </Button> */}
              </Stack>
            </form>
          </Stack>
        </Flex>

        {/* RIGHT SIDE: IMAGE + TEXT */}
        <Flex
          flex={1}
          backgroundImage={`url(${background})`}
          backgroundSize="cover"
          backgroundPosition="center"
          p={8}
        >
          <Flex direction="column">
            <Heading color="white">GUESTPOV</Heading>
            <Spacer />
            <VStack align="stretch" spacing={8}>
              <Heading color="white" fontSize={{ base: "2xl", md: "3xl" }}>
                Share all the photos & videos taken by you and your guests on a
                LIVE Photo Wall.
              </Heading>
              <Text color="white">
                Create an account and discover the world’s best event photo
                sharing experience.
              </Text>

              <Stack direction="row" spacing={4} align="center">
                <AvatarGroup>
                  {avatars.map((a) => (
                    <Avatar
                      key={a.name}
                      name={a.name}
                      src={a.url}
                      position="relative"
                      zIndex={2}
                    />
                  ))}
                </AvatarGroup>
                <Text fontSize="4xl" color="white">
                  +
                </Text>
                <Flex
                  align="center"
                  justify="center"
                  bg="gray.800"
                  color="white"
                  rounded="full"
                  w="60px"
                  h="60px"
                >
                  YOU
                </Flex>
              </Stack>
            </VStack>
            <Spacer />
            <Box>
              <Text color="white">© 2025 GuestPOV. All rights reserved.</Text>
            </Box>
          </Flex>
        </Flex>
      </Stack>

      <ToastContainer />
    </>
  );
}
