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
import { useUserInfo } from "../hooks/useUserInfo";
import { useEffect } from "react";

const downloadQR = () => {
  const canvas = document.getElementById("123456");
  const pngUrl = canvas
    .toDataURL("image/png")
    .replace("image/png", "image/octet-stream");
  let downloadLink = document.createElement("a");
  downloadLink.href = pngUrl;
  downloadLink.download = "123456.png";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

const Event = () => {
  const { id } = useParams();

  const { document, error } = useDocument("events", id);
  const { UserInfo } = useUserInfo();

  const { eventId, changeEvent } = useEvent();
  useEffect(() => {
    changeEvent(id);
  }, []);
  console.log("eventId: ", eventId);

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

          <Box
            w={"100%"}
            h={{ base: "100%", sm: "100%", lg: "100%" }}
            bg={"white"}
            boxShadow={"2xl"}
            rounded={"lg"}
            p={6}
            textAlign={"center"}
            id="GFG"
          >
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "xl", sm: "xl", lg: "2xl" }}
            >
              GUEST PHOTOS & DIGITAL GUESTBOOK
            </Heading>
            <Box my={"40px"} align={"center"}>
              <QRCode
                id="123456"
                value={"https://guestcam3-8cb1f.web.app/guest_login/" + id}
              />
            </Box>

            <Text fontSize={"md"}>{document.welcomeMessage}</Text>
            <Text
              color={"gray.400"}
              mt={"20px"}
              mb={"20px"}
              fontSize={"2xl"}
              fontWeight={"300"}
            >
              {document.eventPageHeader}
            </Text>
            <Text fontSize={"md"}>GUESTCAM</Text>
          </Box>
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
              <Text color={"yellow.500"} fontSize={"2xl"} fontWeight={"700"}>
                {document.eventPageHeader}
              </Text>
              <Text fontSize={"lg"}>{document.welcomeMessage}</Text>
            </VStack>
            <Box>
              <HStack>
                <Text
                  fontSize={{ base: "16px", lg: "18px" }}
                  color={"yellow.500"}
                  fontWeight={"500"}
                  textTransform={"uppercase"}
                  mb={"4"}
                >
                  No Of Guests
                </Text>
                <Spacer></Spacer>
                <Text
                  fontSize={{ base: "16px", lg: "18px" }}
                  color={"black.500"}
                  fontWeight={"500"}
                  textTransform={"uppercase"}
                  mb={"4"}
                >
                  {document.guestList && document.guestList.count}
                  {!document.guestList && "0"}/{document.noOfGuests}
                </Text>
              </HStack>

              <Box border={"solid thin #c5c5c5"} borderRadius={2}>
                <Progress colorScheme="yellow" size="md" value={20} />
              </Box>
            </Box>
            <SimpleGrid columns={{ base: 2, sm: 2, lg: 2, xl: 3 }} spacing={2}>
              <Box>
                <Button
                  px={2}
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
                <Button
                  px={2}
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
              </Box>
              <Box>
                <Button
                  px={2}
                  bg={"#151f21"}
                  color={"white"}
                  width={"100%"}
                  rounded={"md"}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  onClick={() => {
                    history.push(`/guestbook/${UserInfo.role}/${document.id}`);
                  }}
                >
                  Guestbook
                </Button>
              </Box>
              <Box>
                {" "}
                <Button
                  px={2}
                  bg={"#151f21"}
                  color={"white"}
                  rounded={"md"}
                  width={"100%"}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  onClick={downloadQR}
                >
                  Download Qr Code
                </Button>
              </Box>
              <Box>
                {" "}
                <Button
                  px={2}
                  bg={"#151f21"}
                  color={"white"}
                  rounded={"md"}
                  width={"100%"}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                >
                  Print Qr Code
                </Button>
              </Box>
              <Box>
                {" "}
                <Button
                  px={2}
                  bg={"#151f21"}
                  color={"white"}
                  rounded={"md"}
                  width={"100%"}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  onClick={() => {
                    history.push(`/updateevent/${document.id}`);
                  }}
                >
                  Edit Event
                </Button>
              </Box>
              <Box>
                <Button
                  px={2}
                  bg={"#151f21"}
                  color={"white"}
                  rounded={"md"}
                  width={"100%"}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  onClick={() => {
                    changeEvent(id);
                    console.log(`/Guest_Login/${id}`);
                    history.push(`/Guest_Login/${id}`);
                  }}
                >
                  <i>Test QR Code Scan Link</i>
                </Button>
              </Box>
            </SimpleGrid>
            <Box>
              <Text>
                <i>
                  <b>Note:</b> Please copy and paste the QR Code Scan Link in
                  some other browser window if you want to test admin and guest
                  accounts simultaneously. You can also scan code from your
                  phone
                </i>
              </Text>
            </Box>
            <Box>
              <Text
                fontSize={{ base: "16px", lg: "18px" }}
                color={"yellow.500"}
                fontWeight={"500"}
                textTransform={"uppercase"}
                mb={"4"}
              >
                Additional Settings
              </Text>

              <List spacing={2}>
                <ListItem>
                  <Text as={"span"} fontWeight={"bold"}>
                    Share pictures with guests? :{" "}
                  </Text>
                  <Switch
                    colorScheme="yellow"
                    id="share-pictures"
                    defaultChecked
                    isDisabled={true}
                  />
                </ListItem>
                <ListItem>
                  <p mb={2}>
                    Disabling the Guestbook will mean that reference is made in
                    your event site at all. Guest will see no reference to the
                    guestbook and won't be able to leave a guestnook message.
                  </p>
                </ListItem>
                <ListItem>
                  <Text as={"span"} fontWeight={"bold"}>
                    Share guestbook with guests? :{" "}
                  </Text>
                  <Switch
                    colorScheme="yellow"
                    id="share-guestbook"
                    defaultChecked
                    isDisabled={true}
                  />
                </ListItem>
                <ListItem>
                  <p mb={2}>
                    Disabling the Guestbook will mean that reference is made in
                    your event site at all. Guest will see no reference to the
                    guestbook and won't be able to leave a guestnook message.
                  </p>
                </ListItem>
                <ListItem>
                  <Text as={"span"} fontWeight={"bold"}>
                    Share guest photo downloads? :{" "}
                  </Text>
                  <Switch
                    colorScheme="yellow"
                    id="share-guestbook"
                    defaultChecked
                    isDisabled={true}
                  />
                </ListItem>
                <ListItem>
                  <p mb={2}>
                    This setting will allow guests to download full definition
                    versions of any picture uploaded to your event site.They can
                    access this from the "Gallery" using the download icon in
                    the top corner of the image.
                  </p>
                </ListItem>
              </List>
            </Box>
          </Stack>
        </Stack>
      </SimpleGrid>
    </Container>
  );
};

export default Event;
