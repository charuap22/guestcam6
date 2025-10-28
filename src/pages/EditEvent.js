import React, { useEffect, useState, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  projectFirestore,
  projectStorage,
  timestamp,
} from "../firebase/config";
import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  Box,
  Button,
  SimpleGrid,
  Textarea,
  Avatar,
  AvatarBadge,
  Switch,
  Alert,
  AlertIcon,
  Divider,
} from "@chakra-ui/react";
import { IoAddCircleOutline } from "react-icons/io5";
import { Select } from "@chakra-ui/react";
import { usePlan } from "../context/PlanContext";
import { useFirestore } from "../hooks/useFirestore";
import { useDocument } from "../hooks/useDocument";

const EditEvent = () => {
  const { id } = useParams(); // Get event ID from URL
  const history = useHistory();
  const { updateDocument, response } = useFirestore("events");
  const { document: event, error } = useDocument("events", id);
  const { currentPlan } = usePlan();

  const [thumbnail, setThumbnail] = useState(null);
  const [avatarImg, setAvatarImg] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isPending, setIsPending] = useState(false);

  // Form fields
  const [eventName, setEventName] = useState("");
  const [eventPageHeader, setEventPageHeader] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [featureImage, setFeatureImage] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [dateOfEvent, setDateOfEvent] = useState("");
  const [noOfGuests, setNoOfGuests] = useState("");
  const [location, setLocation] = useState("");
  const [sharePictures, setSharePictures] = useState(true);
  const [shareGuestbook, setShareGuestbook] = useState(true);

  useEffect(() => {
    if (event) {
      setEventName(event.eventName);
      setEventPageHeader(event.eventPageHeader);
      setWelcomeMessage(event.welcomeMessage);
      setFeatureImage(event.featureImage);
      setCategory(event.category);
      setDateOfEvent(event.dateOfEvent.toDate().toISOString().split("T")[0]);
      setNoOfGuests(event.noOfGuests);
      setLocation(event.location);
      setSharePictures(event.sharePictures);
      setShareGuestbook(event.shareGuestbook);
      setAvatarImg(event.featureImage);
    }
  }, [event]);

  const eventOptions = {
    Wedding: ["Reception", "Engagement", "Bridal Shower"],
    Corporate: ["Conference", "Seminar", "Product Launch"],
    Birthday: ["Kids Party", "18th Birthday", "50th Celebration"],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let imageURL = featureImage;
      if (thumbnail) {
        const uploadPath = `featureImages/${event.id}/${thumbnail.name}`;
        const img = await projectStorage.ref(uploadPath).put(thumbnail);
        imageURL = await img.ref.getDownloadURL();
      }

      const updates = {
        eventName,
        eventPageHeader,
        welcomeMessage,
        featureImage: imageURL,
        category: category === "other" ? customCategory : category,
        dateOfEvent: timestamp.fromDate(new Date(dateOfEvent)),
        noOfGuests,
        location,
        sharePictures,
        shareGuestbook,
      };

      await updateDocument(id, updates);

      setSuccessMessage("Event updated successfully!");
    } catch (err) {
      setErrorMessage("Failed to update event.");
    } finally {
      setIsPending(false);
    }
  };

  const hiddenFileInput = useRef(null);
  const handleFileChange = async (e) => {
    let selected = e.target.files[0];
    if (selected) {
      setThumbnail(selected);
      setAvatarImg(URL.createObjectURL(selected));
    }
  };

  if (!event) {
    return (
      <Flex minH="80vh" align="center" justify="center">
        <Text>Loading event...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" align="center" bg="gray.50" minH="100vh" p={6}>
      <Box rounded="lg" bg="white" boxShadow="lg" p={8} width="full">
        <Stack spacing={0}>
          <Heading fontSize={"xl"} mb={2}>
            Edit Event
          </Heading>
          <Divider />

          <Stack spacing={4}>
            {successMessage && (
              <Alert status="success">
                <AlertIcon />
                {successMessage}
              </Alert>
            )}
            {errorMessage && (
              <Alert status="error">
                <AlertIcon />
                {errorMessage}
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={10}>
                <Box>
                  <FormControl>
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
                  <FormControl>
                    <FormLabel>Page Header</FormLabel>
                    <Input
                      type="text"
                      required
                      onChange={(e) => setEventPageHeader(e.target.value)}
                      value={eventPageHeader}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl>
                    <FormLabel>Welcome Message</FormLabel>
                    <Textarea
                      required
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      value={welcomeMessage}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl>
                    <FormLabel>Feature Image</FormLabel>
                    <Avatar src={avatarImg} size="xl">
                      <AvatarBadge
                        cursor="pointer"
                        bg="yellow.100"
                        onClick={() => hiddenFileInput.current.click()}
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
                  </FormControl>
                </Box>
                <Box>
                  <FormControl>
                    <FormLabel>Event Type</FormLabel>
                    <Select
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setCustomCategory("");
                      }}
                      value={category}
                    >
                      {Object.entries(eventOptions).map(
                        ([category, events]) => (
                          <optgroup label={category} key={category}>
                            {events.map((event) => (
                              <option key={event} value={event}>
                                {event}
                              </option>
                            ))}
                          </optgroup>
                        )
                      )}
                      <option value="other">Other</option>
                    </Select>
                    {category === "other" && (
                      <Input
                        mt={2}
                        placeholder="Enter custom event type"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                      />
                    )}
                  </FormControl>
                </Box>
                <Box>
                  <FormControl>
                    <FormLabel>Date of Event</FormLabel>
                    <Input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDateOfEvent(e.target.value)}
                      value={dateOfEvent}
                    />
                  </FormControl>
                </Box>
                <Box>
                  <FormControl>
                    <FormLabel>Number of Guests</FormLabel>
                    <Input
                      type="number"
                      min={1}
                      required
                      onChange={(e) => setNoOfGuests(e.target.value)}
                      value={noOfGuests}
                      placeholder="e.g., 100"
                    />
                  </FormControl>
                </Box>
              </SimpleGrid>
              <Button type="submit" bg="yellow.400" color="white" mt={5}>
                {!isPending ? "Update Event" : "Updating..."}
              </Button>
            </form>
          </Stack>
        </Stack>
      </Box>
    </Flex>
  );
};

export default EditEvent;
