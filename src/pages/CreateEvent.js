import React from "react";
import { useState, useEffect, useRef } from "react";

import { useHistory } from "react-router-dom";
import {
  projectFirestore,
  projectStorage,
  timestamp,
} from "../firebase/config";
import { useAuthContext } from "../hooks/useAuthContext";
import {
  Flex,
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
  HStack,
  Textarea,
  Avatar,
  AvatarBadge,
  Switch,
  Alert,
  AlertIcon,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { IoAddCircleOutline } from "react-icons/io5";

import GetPackageInfo from "../components/GetPackageInfo";
import { useFirestore } from "../hooks/useFirestore";
import { usePlan } from "../context/PlanContext";
//import { v4 as uuidv4 } from "uuid";
import { FaArrowUp, FaEdit, FaTrash } from "react-icons/fa";
import { Select } from "@chakra-ui/react";

const CreateEvent = () => {
  const { addDocument, deleteDocument } = useFirestore("events");
  const { currentPlan } = usePlan();
  const { user } = useAuthContext();
  const history = useHistory();
  const toast = useToast();

  // 🔹 State for existing event
  const [eventExists, setEventExists] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  // 🔹 Form fields
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [dateOfEvent, setDateOfEvent] = useState("");
  const [eventPageHeader, setEventPageHeader] = useState("");
  const [featureImage, setFeatureImage] = useState("");
  const [location, setLocation] = useState("");
  const [noOfGuests, setNoOfGuests] = useState("");
  const [shareGuestbook, setShareGuestbook] = useState(true);
  const [sharePictures, setSharePictures] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailError, setThumbnailError] = useState(null);
  const [avatarImg, setAvatarImg] = useState(null);

  const [siteCloses, setSiteCloses] = useState("");
  const [status, setStatus] = useState("Live");

  const [successMessage, setSuccessMessage] = useState(null);

  let start = new Date();
  let end = new Date(start);
  end.setMonth(end.getMonth() + 12);

  // Event options (flat list as requested)
  const EVENT_TYPE_OPTIONS = [
    "Wedding",
    "Corporate",
    "Launch",
    "Birthday",
    "Private Party",
    "Other",
  ];

  // ✅ Check if Admin Already Has an Event
  useEffect(() => {
    if (!user?.uid) return;

    const checkEventExists = async () => {
      setLoadingCheck(true);
      try {
        const userEventsRef = projectFirestore
          .collection("events")
          .where("adminId", "==", user.uid);
        const snapshot = await userEventsRef.get();

        if (!snapshot.empty) {
          const eventDoc = snapshot.docs[0];
          setEventExists(true);
          setEventData({ id: eventDoc.id, ...eventDoc.data() }); // ✅ Store Firestore ID
        }
      } catch (err) {
        console.error("Error checking event existence:", err);
      } finally {
        setLoadingCheck(false);
      }
    };

    checkEventExists();
  }, [user?.uid]);

  // ✅ Handle Event Creation
  const handleSubmit = async (e) => {
    if (!user) {
      setError("User not logged in.");
      return;
    }
    e.preventDefault();
    setIsPending(true);
    setError(null);

    // Use the selected category; if "Other", require customCategory
    const finalCategory =
      category === "Other" ? customCategory.trim() : category;

    if (!eventName || !eventPageHeader || !welcomeMessage || !dateOfEvent) {
      setError("Please fill in all required fields.");
      setIsPending(false);
      return;
    }
    if (category === "Other" && !customCategory.trim()) {
      setError("Please enter a custom event type.");
      setIsPending(false);
      return;
    }

    try {
      if (eventExists) {
        setIsPending(false);
        setError("You can only create 1 event.");
        return; // Stop execution if an event exists
      }

      // ✅ Step 2: Proceed with event creation
      const createdBy = {
        displayName: user.displayName,
        photoUrl: user.photoURL,
        id: user.uid,
      };

      const adminId = user.uid;
      const guestList = [];

      if (thumbnail) {
        // keep using user.uid folder (matches rules)
        const safeName = `${Date.now()}_${thumbnail.name.replace(/\s+/g, "_")}`;
        const uploadPath = `featureImages/${user.uid}/${safeName}`;
        const metadata = {
          contentType: thumbnail.type || "image/jpeg",
          customMetadata: { userId: user.uid },
        };

        const img = await projectStorage
          .ref(uploadPath)
          .put(thumbnail, metadata);
        const imageURL = await img.ref.getDownloadURL();

        // ✅ Create event object
        const event = {
          category: finalCategory,
          dateOfEvent: timestamp.fromDate(new Date(dateOfEvent)),
          eventName,
          eventPageHeader,
          featureImage: imageURL,
          location,
          // noOfGuests,
          shareGuestbook,
          sharePictures,
          siteCloses: timestamp.fromDate(
            new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          ),
          siteStatus: "Live",
          welcomeMessage,
          guestList,
          createdBy, // <-- needed for owner access
          adminId,
          plan: currentPlan?.Name || "No Plan",
          amount: currentPlan?.Price || 0,
          guestBook: [],
          isPublic: true, // <-- needed for guest access
        };

        const response = await addDocument(event);
        if (!response?.id) throw new Error("Failed to save event.");

        // ✅ Save Firestore-generated ID to user document
        await projectFirestore.collection("users").doc(user.uid).update({
          eventId: response.id,
        });

        console.log("Event Created & User Updated:", response);
        setIsPending(false);
        setEventExists(true);
        setEventData({ id: response.id, ...event });

        setError(null);
        // 🔹 Show success toast
        toast({
          title: "Event Created",
          description: "Your event has been successfully created.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setTimeout(() => {
          history.push("/admin/dashboard");
        }, 1500); // ✅ Redirect after a short delay
      } else {
        setError("Please select an event image.");
      }
    } catch (err) {
      setIsPending(false);
      setError(err.message);
    }
  };

  // ✅ Handle Event Deletion
  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );

    if (confirmDelete) {
      setIsPending(true); // ⏳ Show loading state while deleting
      try {
        await projectFirestore.collection("events").doc(eventId).delete(); // ✅ Ensure Firestore deletion

        // Wait for Firestore to confirm deletion
        const checkEvent = await projectFirestore
          .collection("events")
          .doc(eventId)
          .get();
        if (checkEvent.exists) {
          throw new Error("Event was not deleted successfully.");
        }

        toast({
          title: "Event Deleted",
          description: "The event has been successfully deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });

        // ✅ Only now update the UI
        setEventExists(false);
        setEventData(null);
      } catch (err) {
        toast({
          title: "Error",
          description: err.message || "Failed to delete the event.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      } finally {
        setIsPending(false); // 🔄 Reset loading state
      }
    }
  };

  // Create a reference to the hidden file input element
  const hiddenFileInput = useRef(null);

  // Programatically click the hidden file input element
  // when the Button component is clicked
  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };

  // Call a function (passed as a prop from the parent component)
  // to handle the user-selected file
  const handleFileChange = async (e) => {
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
  };

  return (
    <Flex direction="column" align="center" minH="100vh" p={6} mt={20}>
      <Box rounded="lg" bg="white" boxShadow="lg" p={8} width="full">
        <Stack spacing={0}>
          <Heading fontSize={"xl"} mb={0} pb={0}>
            Create Event
          </Heading>
          <hr></hr>

          <Stack spacing={4}>
            {successMessage && (
              <Alert status="success" mt={4}>
                <AlertIcon />
                {successMessage}
              </Alert>
            )}
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
            )}{" "}
            {loadingCheck ? (
              <Alert status="info" rounded="lg" boxShadow="md">
                <AlertIcon />
                Checking for existing events...
              </Alert>
            ) : eventExists && eventData ? (
              <Box
                p={6}
                bg="yellow.50"
                border="1px solid"
                borderColor="yellow.300"
                rounded="lg"
                boxShadow="md"
                textAlign="center"
              >
                <Heading size="md" color="yellow.800">
                  You Already Have an Active Event
                </Heading>
                <Text fontSize="lg" mt={2} fontWeight="medium">
                  <b>{eventData.eventName}</b> is your current event.
                </Text>
                <HStack mt={4} justify="center" spacing={4}>
                  <Button
                    colorScheme="blue"
                    leftIcon={<FaEdit />}
                    onClick={() => history.push(`/edit-event/${eventData.id}`)}
                  >
                    Edit Event
                  </Button>
                  <Button
                    colorScheme="red"
                    leftIcon={<FaTrash />}
                    onClick={() => handleDelete(eventData.id)}
                  >
                    Delete Event
                  </Button>
                </HStack>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={10}>
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
                      <FormLabel> Page Header</FormLabel>
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
                    <FormControl id="Category">
                      <FormLabel>Event Type</FormLabel>
                      <Select
                        size="md"
                        sx={{
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          height: "40px",
                          padding: "8px",
                        }}
                        placeholder="Select Event Type"
                        onChange={(e) => {
                          const value = e.target.value;
                          setCategory(value);
                          if (value !== "Other") setCustomCategory("");
                        }}
                        value={category}
                        required
                      >
                        {EVENT_TYPE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Select>

                      {/* Show input field if "Other" is selected */}
                      {category === "Other" && (
                        <Input
                          mt={2}
                          color={"black"}
                          placeholder="Enter custom event type"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          onBlur={() => {
                            if (customCategory.trim()) {
                              setCategory(customCategory); // ✅ Set the category only when the input has a value
                            }
                          }}
                        />
                      )}
                    </FormControl>
                  </Box>
                  <Box>
                    <FormControl id="Date-of-Event">
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
                    <FormControl id="Location">
                      <FormLabel>Location</FormLabel>
                      <Input
                        type="text"
                        onChange={(e) => setLocation(e.target.value)}
                        value={location}
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
            )}
          </Stack>
        </Stack>
      </Box>
    </Flex>
  );
};
export default CreateEvent;
