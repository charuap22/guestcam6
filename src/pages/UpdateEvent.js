import { useParams } from "react-router-dom";
import { useDocument } from "../hooks/useDocument";
import {
  chakra,
  Container,
  Image,
  Flex,
  VStack,
  StackDivider,
  useColorModeValue,
  VisuallyHidden,
  List,
  ListItem,
  Progress,
  HStack,
  Spacer,
  Switch,
} from "@chakra-ui/react";
import {
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  Link,
  Box,
  Checkbox,
  Button,
  SimpleGrid,
  Textarea,
  Avatar,
  AvatarBadge,
  NumberInput,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { AddCircleIcon } from "chakra-ui-ionicons";
import { FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { MdLocalShipping } from "react-icons/md";
import { CircleIcon } from "../components/EventsList";
import QRCode from "qrcode.react";
import { useEvent } from "../hooks/useEvent";
import { useHistory } from "react-router-dom";
import { useUserInfo } from "../hooks/useUserInfo";
import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { projectStorage, timestamp } from "../firebase/config";
import { useFirestore } from "../hooks/useFirestore";
import GetPackageInfo from "../components/GetPackageInfo";
import { usePlan } from "../hooks/usePlan";

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

const UpdateEvent = () => {
  const { id } = useParams();

  const { document, error: getEventError } = useDocument("events", id);
  const { updateDocument, response } = useFirestore("events");
  const { UserInfo } = useUserInfo();

  const { eventId, changeEvent } = useEvent();

  //////
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailError, setThumbnailError] = useState(null);
  const [avatarImg, setAvatarImg] = useState(null);

  const { user } = useAuthContext();
  const { plan } = usePlan();

  // Create a reference to the hidden file input element
  const hiddenFileInput = useRef(null);
  //form fields
  const [category, setCategory] = useState("");
  const [dateOfEvent, setDateOfEvent] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventPageHeader, setEventPageHeader] = useState("");
  const [featureImage, setFeatureImage] = useState("");
  const [location, setLocation] = useState("");
  const [noOfGuests, setNoOfGuests] = useState("");
  const [shareGuestbook, setShareGuestbook] = useState(true);
  const [sharePictures, setSharePictures] = useState(true);
  const [siteCloses, setSiteCloses] = useState("");
  const [siteStatus, setSiteStatus] = useState("Live");
  const [welcomeMessage, setWelcomeMessage] = useState("");

  const [featureImageChanged, setfeatureImageChanged] = useState(false);
  const today = new Date();

  const date = today.setDate(today.getDate());
  const defaultValue = new Date(date).toISOString().split("T")[0]; // yyyy-mm-dd

  useEffect(() => {
    changeEvent(id);

    if (document) {
      setAvatarImg(document.featureImage);
      setThumbnail(document.featureImage);

      setCategory(document.category);
      setDateOfEvent(document.dateOfEvent);
      setEventName(document.eventName);
      setEventPageHeader(document.eventPageHeader);
      setFeatureImage(document.featureImage);
      setLocation(document.location);
      setNoOfGuests(document.noOfGuests);
      setShareGuestbook(document.shareGuestbook);
      setSharePictures(document.sharePictures);
      setSiteCloses(document.siteCloses);
      setSiteStatus(document.siteStatus);
      setWelcomeMessage(document.welcomeMessage);
    }
  }, [document]);

  console.log("eventId: ", eventId);

  let history = useHistory();
  if (error) {
    return <div className="error">{error}</div>;
  }
  if (!document) {
    return <div className="loading">Loading...</div>;
  }

  let start = new Date();
  let end = new Date(start);
  end.setMonth(end.getMonth() + 12);

  const handleSubmit = async (e) => {
    setIsPending(true);
    e.preventDefault();

    const createdBy = {
      displayName: user.displayName,
      photoUrl: user.photoURL,
      id: user.uid,
    };
    const adminId = user.uid;
    const guestList = [];

    if (thumbnail) {
      const uploadPath = `featureImages/${user.uid}/${thumbnail.name}`;
      const img = await projectStorage.ref(uploadPath).put(thumbnail);
      const imageURL = await img.ref.getDownloadURL();
      //setFeatureImage(imageURL);
      let fimg = "";
      if (featureImageChanged) fimg = imageURL;
      else fimg = featureImage;
      const event = {
        id: document.id,
        category,
        dateOfEvent,
        eventName,
        eventPageHeader,
        featureImage: fimg,
        location,
        noOfGuests,
        shareGuestbook,
        sharePictures,
        siteCloses: timestamp.fromDate(end),
        siteStatus,
        welcomeMessage,
      };
      console.log(event);

      await updateDocument(document.id, event);
      setIsPending(false);
      console.log("created event", response);
      if (!response.error) {
        history.push("/");
      } else {
        setError(response.error);
        return;
      }
    } else {
      setError("Please select an event image");
      return;
    }
  };

  // Programatically click the hidden file input element
  // when the Button component is clicked
  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };

  // Call a function (passed as a prop from the parent component)
  // to handle the user-selected file
  const handleFileChange = async (e) => {
    setfeatureImageChanged(true);
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

    try {
      const file = selected;

      console.log("selected", selected);

      setAvatarImg(URL.createObjectURL(selected));
      setThumbnailError(null);
      setThumbnail(selected);
      setFeatureImage(selected);
      console.log("thumbnail updated");
    } catch (err) {
      setThumbnailError(err);
      return;
    }

    //props.handleFile(fileUploaded);
  };

  return (
    <>
      <Flex align={"center"} justify={"center"} bg={"gray.50"}>
        <Stack spacing={8} mx={"auto"} py={12} px={6} width={"100%"}>
          <Stack align={"center"}>
            <Box
              w="80%"
              bg={"white"}
              boxShadow={"2xl"}
              rounded={"lg"}
              p={6}
              textAlign={"left"}
            >
              <SimpleGrid columns={2} spacing={10}>
                <GetPackageInfo plan={plan}></GetPackageInfo>
                <Box verticalAlign={"center"} pt={"25px"} align={"right"}>
                  <Button colorScheme="gray">Upgrade Package</Button>
                </Box>
              </SimpleGrid>
            </Box>
          </Stack>
          <Box
            rounded={"lg"}
            bg={"white"}
            boxShadow={"lg"}
            p={8}
            width="80%"
            mx={"auto"}
          >
            <Stack spacing={4}>
              <Heading fontSize={"xl"} mb={2}>
                Update Event
              </Heading>
              <hr></hr>
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
              <form onSubmit={handleSubmit}>
                <SimpleGrid columns={2} spacing={10}>
                  <Box>
                    <FormControl id="Name">
                      <FormLabel>Event Name</FormLabel>
                      <Input
                        type="text"
                        required
                        onChange={(e) => setEventName(e.target.value)}
                        value={eventName}
                      />
                    </FormControl>
                  </Box>
                  <Box>
                    <FormControl id="Header">
                      <FormLabel>Event Page Header</FormLabel>
                      <Input
                        type="text"
                        required
                        onChange={(e) => setEventPageHeader(e.target.value)}
                        value={eventPageHeader}
                      />
                    </FormControl>
                  </Box>

                  <Box>
                    <FormControl id="Welcome-Message">
                      <FormLabel>Welcome Message</FormLabel>
                      <Textarea
                        required
                        onChange={(e) => setWelcomeMessage(e.target.value)}
                        value={welcomeMessage}
                      />
                    </FormControl>
                  </Box>
                  <Box>
                    <FormControl id="Feature-Image">
                      <FormLabel>Feature Image</FormLabel>

                      <Avatar
                        width="100px"
                        height="100px"
                        size="xl"
                        border="5px solid #EFEDFF"
                        bg="gray.500"
                        src={avatarImg}
                        borderRadius={2}
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
                    </FormControl>
                  </Box>
                  <Box>
                    <FormControl id="Category">
                      <FormLabel>Category</FormLabel>
                      <Input
                        type="text"
                        required
                        onChange={(e) => setCategory(e.target.value)}
                        value={category}
                      ></Input>
                    </FormControl>
                  </Box>
                  <Box>
                    <FormControl id="Date-of-Event">
                      <FormLabel>Date of Event</FormLabel>
                      <Input
                        type="date"
                        required
                        onChange={(e) => setDateOfEvent(e.target.value)}
                        defaultValue={
                          document.dateOfEvent
                            .toDate()
                            .toISOString()
                            .split("T")[0]
                        }
                      />
                    </FormControl>
                  </Box>
                  <Box>
                    <FormControl id="noOfGuests">
                      <FormLabel>No of Guests</FormLabel>
                      <Input
                        type="number"
                        // defaultValue={pricingPlan.NoOfGuests_end}
                        // min={pricingPlan.NoOfGuests_end}
                        // max={pricingPlan.NoOfGuests_end}
                        required
                        onChange={(e) => setNoOfGuests(e.target.value)}
                        value={noOfGuests}
                      ></Input>
                    </FormControl>
                  </Box>
                  <Box>
                    <FormControl id="Location">
                      <FormLabel>Location</FormLabel>
                      <Input
                        type="text"
                        onChange={(e) => setLocation(e.target.value)}
                        value={location}
                      />
                    </FormControl>
                  </Box>

                  <Box>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="share-pictures" mb="0">
                        Share pictures with guests?
                      </FormLabel>
                      <Switch
                        id="share-pictures"
                        colorScheme="yellow"
                        onChange={() => setSharePictures(!sharePictures)}
                        isChecked={sharePictures}
                        isDisabled={false}
                      />
                    </FormControl>
                    <br></br>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="share-guestbook" mb="0">
                        Share guestbook with guests?
                      </FormLabel>
                      <Switch
                        colorScheme="yellow"
                        id="share-guestbook"
                        onChange={() => setShareGuestbook(!shareGuestbook)}
                        isChecked={shareGuestbook}
                        isDisabled={false}
                      />
                    </FormControl>
                  </Box>
                </SimpleGrid>
                <br></br>
                <Button
                  type="submit"
                  bg={"yellow.400"}
                  color={"white"}
                  _hover={{
                    bg: "yellow.500",
                  }}
                >
                  {!isPending && "Save Event"}
                  {isPending && "Creating Event..."}
                </Button>
              </form>
            </Stack>
          </Box>
        </Stack>
      </Flex>
    </>
  );
};

export default UpdateEvent;
