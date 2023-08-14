import {
  useDisclosure,
  Button,
  Slide,
  Box,
  HStack,
  Flex,
  Spacer,
  Heading,
  Stack,
  SimpleGrid,
  Avatar,
  AvatarBadge,
  Text,
  Alert,
  AlertIcon,
  Image,
  Icon,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useEvent } from "../hooks/useEvent";
export const CircleIcon = (props) => (
  <Icon viewBox="0 0 200 200" {...props}>
    <path
      fill="currentColor"
      d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
    />
  </Icon>
);

export default function EventsList({ events }) {
  return (
    <div>
      {events.length === 0 && <p>No events yet!</p>}
      {events.map((event) => (
        <Stack
          key={event.id}
          style={{ background: "#f7f5f1bd", padding: "30px" }}
          align={"center"}
          spacing={{ base: 8, md: 10 }}
          py={{ base: 20, md: 28 }}
          direction={{ base: "column", md: "row" }}
          mb={"40px"}
        >
          <Stack flex={1} spacing={{ base: 5, md: 10 }}>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "2xl", sm: "3xl", lg: "5  xl" }}
            >
              <Text
                as={"span"}
                position={"relative"}
                _after={{
                  content: "''",
                  width: "full",
                  height: "30%",
                  position: "absolute",
                  bottom: 1,
                  left: 0,
                  bg: "red.400",
                  zIndex: -1,
                }}
              >
                {event.eventName}
              </Text>
              <br />
              <Text
                as={"span"}
                color={"red.400"}
                fontSize={{ base: "md", sm: "l", lg: "xl" }}
              >
                {event.siteStatus}
                <CircleIcon
                  boxSize={6}
                  ml={2}
                  color={event.siteStatus === "Live" ? "green.500" : "red.500"}
                />
              </Text>
              <Text
                fontSize={{ base: "md", sm: "l", lg: "xl" }}
                fontWeight={"bold"}
              >
                {event.eventPageHeader}
              </Text>
            </Heading>

            <Text color={"gray.500"}>{event.welcomeMessage}</Text>
            <Stack
              spacing={{ base: 4, sm: 6 }}
              direction={{ base: "row", sm: "column", md: "row", lg: "row" }}
            >
              <Box
                size={"lg"}
                fontWeight={"normal"}
                px={6}
                py={2}
                background={"#edf2f7"}
              >
                Date of Event:
                <b> {event.dateOfEvent.toDate().toDateString()}</b>
              </Box>
              <Link to={`/events/${event.id}`}>
                <Button
                  key={event.id}
                  rounded={"full"}
                  size={"lg"}
                  fontWeight={"normal"}
                  px={6}
                  colorScheme={"red"}
                  bg={"#a78200"}
                  _hover={{ bg: "#634d01" }}
                >
                  Get started
                </Button>
              </Link>
            </Stack>
          </Stack>
          <Flex
            flex={1}
            justify={"center"}
            align={"center"}
            position={"relative"}
            w={"full"}
          >
            <Image
              alt={"Hero Image"}
              fit={"cover"}
              align={"center"}
              w={"100%"}
              h={"100%"}
              src={event.featureImage}
            />
          </Flex>
        </Stack>
      ))}
    </div>
  );
}
