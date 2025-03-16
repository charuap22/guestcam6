import { useParams } from "react-router-dom";
import { useDocument } from "../hooks/useDocument";
import {
  Box,
  chakra,
  Container,
  Stack,
  Text,
  Image,
  Flex,
  VStack,
  Button,
  Heading,
  SimpleGrid,
  StackDivider,
  useColorModeValue,
  VisuallyHidden,
  List,
  ListItem,
  Progress,
  HStack,
  Spacer,
  Switch,
  Link,
} from "@chakra-ui/react";
import { FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { MdLocalShipping } from "react-icons/md";
import { CircleIcon } from "../components/EventsList";
import QRCode from "qrcode.react";
import { useEvent } from "../hooks/useEvent";
import { useHistory } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useUserInfo } from "../hooks/useUserInfo";

const Guest_Dashboard = () => {
  const { user } = useAuthContext();
  console.log("guest", user);
  const { UserInfo } = useUserInfo();

  const { id } = useParams();

  const { document, error } = useDocument("events", id);

  let history = useHistory();
  if (error) {
    return <div className="error">{error}</div>;
  }
  if (!document) {
    return <div className="loading">Loading...</div>;
  }
  return (
    <Container maxW={"7xl"}>
      <SimpleGrid
        columns={{ base: 1, lg: 2 }}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 18, md: 24 }}
      >
        <VStack>
          <Image
            rounded={"md"}
            alt={"product image"}
            src={document.featureImage}
            fit={"cover"}
            align={"center"}
            w={"100%"}
            h={{ base: "100%", sm: "400px", lg: "500px" }}
          />
        </VStack>
        <Stack spacing={{ base: 6, md: 10 }}>
          <Box as={"header"}>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "2xl", sm: "4xl", lg: "5xl" }}
            >
              {document.eventName}
            </Heading>
            <br></br>
            <Text color={"gray.900"} fontWeight={300} fontSize={"xl"}>
              Date of Event:{" "}
              <b>{document.dateOfEvent.toDate().toDateString()}</b>
            </Text>
            <Text color={"gray.900"} fontWeight={300} fontSize={"xl"}>
              Site Closes: <b>{document.siteCloses.toDate().toDateString()}</b>
            </Text>
            <Text
              as={"span"}
              color={"red.400"}
              fontSize={{ base: "md", sm: "l", lg: "xl" }}
              fontWeight={"500"}
            >
              {document.siteStatus}
              <CircleIcon
                boxSize={6}
                ml={2}
                color={document.siteStatus === "Live" ? "green.500" : "red.500"}
              />
            </Text>
          </Box>

          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={"column"}
            divider={<StackDivider borderColor={"gray.600"} />}
          >
            <VStack spacing={{ base: 4, sm: 6 }} align={"left"}>
              <Text color={"yellow.500"} fontSize={"2xl"} fontWeight={"500"}>
                {document.eventPageHeader}
              </Text>
              <Text fontSize={"lg"}>{document.welcomeMessage}</Text>
            </VStack>

            <SimpleGrid columns={{ base: 3, sm: 2, lg: 3 }} spacing={2}>
              <Box>
                <Button
                  px={8}
                  bg={"#151f21"}
                  color={"white"}
                  rounded={"md"}
                  width={"100%"}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  onClick={() => {
                    //changeEvent(document.id);

                    history.push(`/gallery/${UserInfo.role}/${document.id}`);
                  }}
                >
                  Photos
                </Button>
              </Box>
              <Box>
                <Link to={`/gallery/${document.id}`}>
                  <Button
                    px={8}
                    bg={"#151f21"}
                    color={"white"}
                    rounded={"md"}
                    width={"100%"}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                    }}
                    onClick={() => {
                      history.push(`/videos/${UserInfo.role}/${document.id}`);
                    }}
                  >
                    Videos
                  </Button>
                </Link>
              </Box>
              <Box>
                <Link to={`/guestbook/guest/${document.id}`}>
                  <Button
                    px={8}
                    bg={"#151f21"}
                    color={"white"}
                    width={"100%"}
                    rounded={"md"}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                    }}
                    onClick={() => {
                      history.push(
                        `/guestbook/${UserInfo.role}/${document.id}`
                      );
                    }}
                  >
                    Guestbook
                  </Button>
                </Link>
              </Box>
            </SimpleGrid>
          </Stack>
        </Stack>
      </SimpleGrid>
    </Container>
  );
};

export default Guest_Dashboard;
