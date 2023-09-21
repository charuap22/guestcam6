import React, { useState } from "react";
import { useFirestore } from "../hooks/useFirestore";
import { projectFirestore } from "../firebase/config";
// import Trashcan from "../assets/trashcan.svg";
import { motion } from "framer-motion";
import {
  Avatar,
  Box,
  Grid,
  GridItem,
  Video,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
import { AspectRatio } from "@chakra-ui/react";
import ReactPlayer from "react-player/lazy";
import {
  Alert,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { BsThreeDotsVertical, BsChatSquareQuote } from "react-icons/bs";
import { RiShutDownLine, RiRestartLine, RiFileShredLine } from "react-icons/ri";
import {
  AiOutlineSelect,
  AiOutlineCloudDownload,
  AiOutlineFileZip,
  AiOutlineDelete,
} from "react-icons/ai";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { SRLWrapper } from "simple-react-lightbox";

import VideoCard, { downloadVideo } from "./VideoCard";

import JSZip from "jszip";
import { saveAs } from "file-saver";
import firebase from "firebase/app";
import { AlertIcon } from "chakra-ui-ionicons";
import { downloadFolderAsZip } from "./ImageGrid";

const VideoGrid = ({ videos, eventId, userId, userType }) => {
  const { deleteDocument } = useFirestore("videos");
  const [showSelectOption, setShowSelectOption] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const [zipProcessing, setZipProcessing] = useState(false);
  let selectedItems = [];
  console.log("videos", videos);
  if (videos.length === 0) {
    return <div className="error">No videos to load...</div>;
  }
  const deleteVideo = (id) => {
    // projectFirestore.collection("gallery").doc(id).delete();
  };
  const showSelectVideosToast = () => {
    toast({
      title: "Select videos to download",
      position: "top",
      isClosable: true,
      duration: 9000,
    });
  };
  const downloadVideos = () => {
    if (selectedItems.length == 0) {
      showSelectVideosToast();
    }
    selectedItems.map((video) => {
      downloadVideo(video.url, video.id);
    });
  };

  const deleteVideos = () => {
    if (selectedItems.length == 0) {
      showSelectVideosToast();
    }
    selectedItems.map((video) => {
      console.log("userId", userId);
      console.log("video.createdBy", userId);
      console.log("userType", userType);

      if (video.createdBy == userId || userType == "Admin")
        deleteDocument(video.id);
      else
        toast({
          title: "You can delete only those videos that you have uploaded!",
          position: "top",
          isClosable: true,
          duration: 9000,
        });
    });
  };
  const handleSelectVideo = (video) => {
    if (video.selected == "selected") {
      if (selectedItems.filter((item) => item.id == video.id).length <= 0)
        selectedItems = [...selectedItems, video];
    } else if (video.selected == "deselected") {
      if (selectedItems.filter((item) => item.id == video.id).length > 0)
        selectedItems = selectedItems.filter((i) => {
          return i.id !== video.id;
        });
    }
    console.log(selectedItems);
  };
  return (
    <>
      <Box
        w="100%"
        maxW="90%"
        mx="auto"
        px={4}
        spacing={4}
        direction="row"
        align="center"
      >
        {error && (
          <Alert p={2} marginBottom={4} status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
      </Box>
      <Flex justifyContent="right" mb={4} w="100%" maxW="90%" mx="auto" px={4}>
        <Button
          px={4}
          mr={2}
          bg={showSelectOption ? "gray.500" : "#151f21"}
          color={"white"}
          rounded={"md"}
          width={"auto"}
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "lg",
          }}
          onClick={() => {
            setShowSelectOption(!showSelectOption);
          }}
        >
          Select Videos
        </Button>
        <Popover placement="bottom" isLazy>
          <PopoverTrigger>
            <Button
              rightIcon={<ChevronDownIcon />}
              background="yellow.500"
              color={"white"}
              w="fit-content"
              _hover={{ bg: "gray.500" }}
            >
              Quick Actions
            </Button>
          </PopoverTrigger>
          <PopoverContent _focus={{ boxShadown: "none" }}>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader fontWeight="bold">Quick Actions</PopoverHeader>
            <PopoverBody>
              <Stack>
                <Button
                  w="100%"
                  variant="ghost"
                  rightIcon={<AiOutlineCloudDownload />}
                  justifyContent="space-between"
                  fontWeight="normal"
                  colorScheme="yellow"
                  onClick={() => {
                    downloadVideos();
                  }}
                >
                  Download
                </Button>
                <Button
                  w="100%"
                  variant="ghost"
                  rightIcon={<AiOutlineDelete />}
                  justifyContent="space-between"
                  fontWeight="normal"
                  colorScheme="yellow"
                  onClick={() => {
                    deleteVideos();
                  }}
                >
                  Delete
                </Button>
                {!zipProcessing && (
                  <Button
                    w="100%"
                    variant="ghost"
                    rightIcon={<AiOutlineFileZip />}
                    justifyContent="space-between"
                    fontWeight="normal"
                    colorScheme="yellow"
                    onClick={() => {
                      setZipProcessing(true);
                      downloadFolderAsZip("videos/" + eventId)
                        .catch((error) => {
                          setError(error.message);
                          console.log(error.message);
                        })
                        .finally(() => {
                          setZipProcessing(false);
                        });
                    }}
                  >
                    Download All as Zip
                  </Button>
                )}
                {zipProcessing && (
                  <Button
                    w="100%"
                    variant="ghost"
                    rightIcon={<AiOutlineFileZip />}
                    justifyContent="space-between"
                    fontWeight="normal"
                    colorScheme="yellow"
                    isLoading
                    loadingText="Processing..."
                  >
                    Processing...
                  </Button>
                )}
              </Stack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Flex>

      <Box
        w="100%"
        maxW="90%"
        mx="auto"
        px={4}
        spacing={4}
        direction="row"
        align="center"
      >
        {error && (
          <Alert p={2} marginBottom={4} status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
      </Box>

      <SRLWrapper>
        <Box
          padding={4}
          w="100%"
          maxW="90%"
          mx="auto"
          // bg="gray.800"
          sx={{ columnCount: [1, 2, 3], columnGap: "8px" }}
        >
          {videos.map((video) => (
            // <Video
            //   key={doc.url}
            //   w="100%"
            //   borderRadius="xl"
            //   mb={2}
            //   d="inline-block"
            //   src={doc.url}
            //   alt="Alt"
            // />
            <VideoCard
              key={video.id}
              video={video}
              onSelectVideo={handleSelectVideo}
              showSelectOption={showSelectOption}
            ></VideoCard>
          ))}
        </Box>
        {/* <Grid
          templateColumns={{
            base: "repeat(3, 1fr)",
            sm: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(2, 1fr)",
            xl: "repeat(3, 1fr)",
            "2xl": "repeat(3, 1fr)",
          }}
          gap={6}
          padding={4}
          w="100%"
          maxW="90%"
          mx="auto"
        >
          {videos.map((doc) => (
            <GridItem w="100%" bg="blue.500">
              <ReactPlayer
                width="100%"
                style={{ display: "inline-block" }}
                url={doc.url}
                controls
              />
            </GridItem>
          ))}
        </Grid>*/}
      </SRLWrapper>

      {/* <Box
        as={motion.div}
        whileHover={{ opacity: 1 }}
        padding={4}
        w="100%"
        maxW="90%"
        mx="auto"
        sx={{ columnCount: [1, 2], columnGap: "20px" }}
      >
        {videos.map((doc) => (
          <ReactPlayer
            width="90%"
            style={{ margin: "10px" }}
            url={doc.url}
            controls
          />
        ))}
      </Box> */}
    </>
  );
};

export default VideoGrid;
