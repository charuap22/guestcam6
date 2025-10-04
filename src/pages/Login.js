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
  Link,
  FormControl,
  FormLabel,
  Checkbox,
  Divider,
  AbsoluteCenter,
} from "@chakra-ui/react";
import background from "../assets/party_slide2.jpeg";
import { AddCircleIcon } from "chakra-ui-ionicons";
import { useState, useRef } from "react";
import { useLogin } from "../hooks/useLogin";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { NavLink } from "react-router-dom";
import { FacebookLoginButton } from "react-social-login-buttons";
import { GoogleLoginButton } from "react-social-login-buttons";

export default function Login() {
  const [email, setEmail] = useState("gaurav9@gmail.com");
  const [password, setPassword] = useState("123456");

  const { login, Googlelogin,Facebooklogin,isPending, error } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };
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

  return (
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
                  placeholder="Password"
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
              </FormControl>
              <Stack spacing={6}>
                <Stack
                  direction={{ base: "column", sm: "row" }}
                  align={"start"}
                  justify={"space-between"}
                >
                  <Checkbox>Remember me</Checkbox>
                  <Link color={"blue.500"}>Forgot password?</Link>
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
              >
                {!isPending && "Continue >"}
                {isPending && "Loading..."}
              </Button>
            </Stack>
          </form>
          <Box position="relative" padding="10">
            <Divider />
            <AbsoluteCenter bg="white" px="4" fontWeight={"500"}>
              OR
            </AbsoluteCenter>
          </Box>
          <Stack>
            <GoogleLoginButton
              onClick={() => {
               Googlelogin();
              }}
            />
            <FacebookLoginButton
              onClick={() => {
                Facebooklogin();
              }}
            />
          </Stack>
        </Stack>
      </Flex>
      <Flex
        flex={1}
        backgroundImage={`url(${background})`}
        backgroundSize={["cover", "cover", "cover", "cover"]}
        background-repeat="no-repeat"
        backgroundPosition="center"
        p={8}
      >
        <Flex flexDirection="column">
          <Heading
            color="white"
            lineHeight={1.1}
            fontSize={{ base: "xl", sm: "xl", md: "xl", lg: "2xl" }}
          >
            GUESTCAM
          </Heading>
          <Spacer></Spacer>
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
                    // size={useBreakpointValue({ base: 'md', md: 'lg' })}
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
          <Spacer></Spacer>
          <Box>
            <Text color="white">© 2023 Guestcam. All rights reserved.</Text>
          </Box>
        </Flex>
      </Flex>
    </Stack>
    // /////////////////////
  );
}
