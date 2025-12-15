// src/site/pages/UseCases.js
import React, { useEffect } from "react";
import {
  Box,
  SimpleGrid,
  Grid,
  GridItem,
  Image,
  Heading,
  Text,
  Stack,
  Badge,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  chakra,
  Flex,
  keyframes,
  Divider,
} from "@chakra-ui/react";
import Footer from "../components/footer/Footer";
import { CheckIcon } from "@chakra-ui/icons";
import Header from "../components/header/Header";
import bannerBg from "../images/party-crowd-background.jpg";

import qrcode from "../images/feature-icons/qr.png";
import upload from "../images/feature-icons/upload.png";
import slideshow from "../images/feature-icons/slideshow.png";
import guestbook from "../images/feature-icons/guestbook.png";

import guestbook2 from "../images/funways/guestbook3.jpg";
import ISpy from "../images/funways/ISpy.jpg";
import photobooth from "../images/funways/photobooth2.jpg";
import slideshow2 from "../images/funways/slideshow.jpg";

const GOLD = "#e6c250";
const DARK_GREY = "#1f1f1f";
const LIGHT_GREY = "#f6f6f6";

const useCasesData = [
  {
    id: "wedding",
    title: "Wedding",
    icon: "💍",
    paragraphs: [
      "Hosting multiple events across your wedding journey?",
      "From engagement to wedding day, and reception — GuestPOV lets you collect photos and videos for every special occasion effortlessly.",
      "Each album has its own QR code and private link, keeping your memories secure yet easily shareable.",
    ],
    image: guestbook2,
  },
  {
    id: "privateparty",
    title: "Private Party",
    icon: "🎉",
    paragraphs: [
      "Turn your private party into a shared experience.",
      "Your guests can upload photos and videos instantly by scanning your event QR code.",
      "No apps. No sign-ups. Just instant, effortless sharing and a live feed of memories.",
    ],
    image: ISpy,
  },
  {
    id: "birthday",
    title: "Birthday Party",
    icon: "🎂",
    paragraphs: [
      "Make birthdays truly memorable.",
      "Capture every smile, every surprise, and every candid moment in one shared album.",
      "Watch your digital photo wall update in real time as your guests upload their moments.",
    ],
    image: photobooth,
  },
  {
    id: "corporate",
    title: "Corporate Party",
    icon: "🏢",
    paragraphs: [
      "Ideal for conferences, offsites, and team events.",
      "Guests can upload photos straight from their phones — perfect for social sharing and internal highlights.",
      "Keep your brand’s best moments in one place, professionally curated and instantly accessible.",
    ],
    image: slideshow2,
  },
];

const featureList = [
  {
    label: "Guests Photos & Videos Experience",
    sub: "See your event through your guests' eyes — collect every photo and video in real time.",
    icon: upload,
  },
  {
    label: "Guestbook",
    sub: "Receive heartfelt written guestbook messages from your guests. It’s the perfect accompaniment to your album.",
    icon: guestbook,
  },
  {
    label: "Extremely Easy to Use",
    sub: "Guests join instantly by scanning a QR code — no app, no registration.",
    icon: qrcode,
  },
  {
    label: "Live Slideshow Stream",
    sub: "Display uploads live on any screen or projector — perfect for parties and receptions.",
    icon: slideshow,
  },
];

// Animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const UseCases = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const panelBg = useColorModeValue("white", DARK_GREY);
  const subtle = useColorModeValue("gray.600", "gray.300");

  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header
        title="Events"
        subtitle="Each celebration is one of a kind — from birthdays and milestones to baby showers and ceremonies. Treasure these moments; they come only once."
        headerImage={bannerBg}
      />

      <Box as="main" py={{ base: 8, md: 12 }} bg={LIGHT_GREY}>
        <Grid
          maxW="1200px"
          mx="auto"
          px={{ base: 4, md: 6 }}
          templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
          gap={8}
          alignItems="start"
        >
          {/* LEFT SIDE — 2-column grid */}
          <GridItem>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {useCasesData.map((uc, i) => (
                <Box
                  key={uc.id}
                  bg={cardBg}
                  borderRadius="xl"
                  boxShadow="md"
                  overflow="hidden"
                  className="fade-in"
                  animation={`${fadeIn} 0.9s ease ${i * 0.15}s forwards`}
                  opacity={0}
                  transition="transform .3s ease, box-shadow .3s ease"
                  _hover={{
                    transform: "translateY(-5px)",
                    boxShadow: "xl",
                  }}
                >
                  <Flex direction="column" height="100%">
                    <Box position="relative">
                      <Image
                        src={uc.image}
                        alt={uc.title}
                        objectFit="cover"
                        w="100%"
                        h={{ base: "220px", md: "200px" }}
                        loading="eager"
                      />
                      <Badge
                        position="absolute"
                        top={3}
                        left={3}
                        bg={`${GOLD}E6`}
                        color="black"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="sm"
                        fontWeight="600"
                      >
                        {uc.icon} {uc.title}
                      </Badge>
                    </Box>

                    <Stack spacing={3} p={{ base: 4, md: 5 }} flex="1">
                      {uc.paragraphs.map((p, idx) => (
                        <Text key={idx} color={subtle}>
                          {p}
                        </Text>
                      ))}
                    </Stack>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          </GridItem>

          {/* RIGHT SIDE — Enriched feature panel */}
          <GridItem>
            <Box
              bg={panelBg}
              borderRadius="2xl"
              p={{ base: 5, md: 6 }}
              boxShadow="xl"
              h="100%"
              color={useColorModeValue(DARK_GREY, "white")}
              className="fade-in"
              animation={`${fadeIn} 1s ease 0.4s forwards`}
              opacity={0}
            >
              <Heading size="md" mb={3} color={GOLD}>
                Event Photo Sharing Made Easy
              </Heading>
              <Text color="gray.600" mt={5} mb={5}>
                Collect and share your guests’ memories effortlessly. GuestPOV
                is designed to make every moment — from the grand entrance to
                the final dance — beautifully captured and instantly shared.
              </Text>

              <List spacing={5} mb={4}>
                {featureList.map((f, i) => (
                  <ListItem
                    key={i}
                    display="flex"
                    gap={3}
                    alignItems="flex-start"
                    className="fade-in"
                    animation={`${fadeIn} 0.8s ease ${
                      0.5 + i * 0.15
                    }s forwards`}
                    opacity={0}
                  >
                    <Box
                      flex="0 0 44px"
                      h="44px"
                      borderRadius="md"
                      bg="white"
                      display="grid"
                      placeItems="center"
                      boxShadow="sm"
                    >
                      <Image src={f.icon} alt="" boxSize="22px" />
                    </Box>
                    <Box>
                      <Text fontWeight="600" color={DARK_GREY}>
                        {f.label}
                      </Text>
                      <Text color="gray.600" mt={1}>
                        {f.sub}
                      </Text>
                    </Box>
                  </ListItem>
                ))}
              </List>

              <Divider my={6} borderColor="gray.300" />

              {/* <Heading size="sm" color={GOLD} mb={3}>
                How It Helps
              </Heading>
              <Text color="gray.600"   mb={4}>
                GuestPOV bridges the gap between being present and capturing the
                moment. Your guests contribute authentic memories while you stay
                immersed in the celebration. Every upload appears instantly,
                building your story together.
              </Text>

              <Divider my={6} borderColor="gray.300" />

              <Heading size="sm" color={GOLD} mb={3}>
                Memories That Last
              </Heading>
              <Text color="gray.600" fontSize="sm" mb={4}>
                Relive your event anytime — browse, download, or project your
                album in full-screen. GuestPOV ensures every candid shot and
                heartfelt smile lives on beautifully.
              </Text> */}

              {/* <Divider my={6} borderColor="gray.300" /> */}

              <Heading size="sm" color={GOLD} mb={3}>
                Why Guests Love It
              </Heading>
              <List spacing={3}>
                <ListItem>
                  <p>
                    {" "}
                    <ListIcon as={CheckIcon} color={GOLD} />
                    Instant uploads — no app needed
                  </p>
                </ListItem>
                <ListItem>
                  <p>
                    {" "}
                    <ListIcon as={CheckIcon} color={GOLD} />
                    Live slideshow on big screens
                  </p>
                </ListItem>
                <ListItem>
                  <p>
                    <ListIcon as={CheckIcon} color={GOLD} />
                    Private & unlimited albums
                  </p>
                </ListItem>
              </List>
            </Box>
          </GridItem>
        </Grid>
      </Box>
      <Footer />
    </>
  );
};

export default UseCases;
