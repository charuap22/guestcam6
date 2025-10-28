import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDocument } from "../hooks/useDocument";
import { useSignup_Guest } from "../hooks/useSignup_Guest";
import { useEvent } from "../hooks/useEvent";
import Resizer from "react-image-file-resizer";

import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Container,
  Input,
  Button,
  Avatar,
  AvatarBadge,
  IconButton,
  Alert,
  AlertIcon,
  VStack,
  FormControl,
  FormLabel,
  useColorModeValue,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import background from "../assets/party_slide2.jpeg";

export default function Guest_Login() {
  const [displayName, setDisplayName] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailError, setThumbnailError] = useState(null);
  const [avatarImg, setAvatarImg] = useState(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("transparent", "rgba(212,175,55,0.08)");
  const avatarBorder = useColorModeValue("gray.50", "gray.700");
  const avatarBg = useColorModeValue("gray.100", "gray.700");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const placeholderColor = useColorModeValue("gray.400", "gray.400");
  const textGold = "#d4af37";

  const { signup, isPending, error } = useSignup_Guest();
  const { id } = useParams();
  const { document, error: fetchError } = useDocument("events", id);
  const { changeEvent } = useEvent();

  useEffect(() => {
    changeEvent(id);
  }, [id, changeEvent]);

  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        250,
        250,
        "JPEG",
        100,
        0,
        (uri) => resolve(uri),
        "file"
      );
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(displayName, thumbnail, id);
  };

  const hiddenFileInput = useRef(null);
  const handleClick = () => hiddenFileInput.current?.click();

  const handleFileChange = async (e) => {
    setThumbnail(null);
    setThumbnailError(null);
    const selected = e.target.files?.[0];
    if (!selected) {
      setThumbnailError("Please select a file");
      return;
    }
    if (!selected.type.includes("image")) {
      setThumbnailError("Selected file must be an image");
      return;
    }
    if (selected.size > 2_000_000) {
      setThumbnailError("Image file size must be less than 2 MB");
      return;
    }
    try {
      const resizedImage = await resizeFile(selected);
      setAvatarImg(URL.createObjectURL(resizedImage));
      setThumbnail(resizedImage);
    } catch (err) {
      setThumbnailError("Failed to process image");
    }
  };

  if (fetchError) {
    return (
      <Container centerContent py={20}>
        <Alert status="error">
          <AlertIcon />
          {fetchError}
        </Alert>
      </Container>
    );
  }

  if (!document) {
    return (
      <Container centerContent py={20}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Stack minH="100vh" direction={{ base: "column", md: "row" }} bg={pageBg}>
      {/* LEFT SIDE: FORM */}
      <Flex p={{ base: 4, md: 8 }} flex={1} align="center" justify="center">
        <Box
          w="full"
          maxW="md"
          bg={cardBg}
          borderRadius="2xl"
          p={{ base: 6, md: 10 }}
          boxShadow="xl"
          border="1px solid"
          borderColor={borderColor}
        >
          <VStack spacing={4} align="stretch" mb={4}>
            <Box textAlign="center">
              <Text fontSize="sm" color="gray.500">
                {document.eventPageHeader}
              </Text>
              <Heading
                as="h2"
                fontSize={{ base: "2xl", md: "3xl" }}
                mt={2}
                color={textGold}
              >
                {document.eventName}
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={2}>
                {document.welcomeMessage}
              </Text>
            </Box>
          </VStack>

          <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
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

              {/* Avatar + Display Name */}
              <Stack
                direction={{ base: "column", md: "row" }}
                spacing={{ base: 6, md: 6 }}
                align="center"
                justify="center"
                w="full"
                textAlign="center"
              >
                {/* Avatar Upload */}
                <Box>
                  <Avatar
                    size="xl"
                    src={avatarImg || undefined}
                    name={displayName || "Guest"}
                    border="4px solid"
                    borderColor={avatarBorder}
                    bg={avatarBg}
                    mx="auto"
                  >
                    <AvatarBadge
                      as={IconButton}
                      aria-label="Upload photo"
                      icon={<AddIcon />}
                      size="sm"
                      rounded="full"
                      onClick={handleClick}
                      bg={textGold}
                      color="black"
                      _hover={{ transform: "translateY(-2px)" }}
                    />
                  </Avatar>

                  <input
                    type="file"
                    accept="image/*"
                    ref={hiddenFileInput}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />

                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Upload a photo (max 2 MB)
                  </Text>
                </Box>

                {/* Display Name Input */}
                <Box w="full" px={{ base: 0, md: 2 }}>
                  <FormControl id="displayName" isRequired>
                    <FormLabel
                      fontSize={{ base: "sm", md: "sm" }}
                      color="gray.600"
                      textAlign={{ base: "center", md: "left" }}
                    >
                      Display Name
                    </FormLabel>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      bg={inputBg}
                      border={0}
                      fontSize={{ base: "md", md: "md" }}
                      py={{ base: 4, md: 3 }}
                      textAlign="center"
                      borderRadius="lg"
                      boxShadow="sm"
                      _focus={{
                        boxShadow: "0 0 0 2px #d4af37",
                      }}
                      _placeholder={{ color: placeholderColor }}
                      w="full"
                    />
                  </FormControl>
                </Box>
              </Stack>

              <Button
                type="submit"
                w="full"
                py={5}
                mt={2}
                fontSize="md"
                fontWeight="bold"
                color="white"
                borderRadius="xl"
                bgGradient="linear(to-r, #0b0b0b, #1f1f1f)"
                border="1px solid rgba(212,175,55,0.5)"
                position="relative"
                overflow="hidden"
                transition="all 0.35s ease"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-120%",
                  width: "220%",
                  height: "100%",
                  bgGradient:
                    "linear(to-r, rgba(212,175,55,0.04), rgba(255,215,0,0.14), rgba(212,175,55,0.04))",
                  transform: "skewX(-20deg)",
                  transition: "all 0.9s cubic-bezier(.2,.9,.2,1)",
                }}
                _hover={{
                  transform: "translateY(-3px)",
                  boxShadow: "0 10px 30px rgba(212,175,55,0.16)",
                  _before: { left: "0%" },
                }}
                _active={{ transform: "scale(0.99)" }}
                isLoading={isPending}
                loadingText="Loading..."
              >
                {!isPending ? "Continue →" : "Loading..."}
              </Button>

              <Box textAlign="center">
                <Text fontSize="xs" color="gray.400">
                  By continuing you accept the event terms.
                </Text>
              </Box>
            </VStack>
          </Box>
        </Box>
      </Flex>

      {/* RIGHT SIDE: IMAGE */}
      <Flex
        flex={1}
        position="relative"
        minH={{ base: "40vh", md: "auto" }}
        backgroundImage={`linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url(${
          document.featureImage || background
        })`}
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        align="center"
        justify="center"
      >
        <Box textAlign="center" p={6} color="white">
          {document.eventDate && (
            <Text fontWeight="semibold" mb={2}>
              {document.eventDate}
            </Text>
          )}
          <Heading fontSize={{ base: "xl", md: "2xl" }} color={textGold}>
            You're invited
          </Heading>
          <Text mt={2} color="gray.200" maxW="lg" mx="auto">
            Join us for a celebration — share moments, photos and memories.
          </Text>
        </Box>
      </Flex>
    </Stack>
  );
}
