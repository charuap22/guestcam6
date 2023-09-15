import React, { useState } from "react";
import { useFirestore } from "../hooks/useFirestore";
//import { projectFirestore } from "../firebase/config";
// import Trashcan from "../assets/trashcan.svg";
import { toast } from "react-toastify";

import { motion } from "framer-motion";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Image,
  Link,
  Stack,
  Text,
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

import ImageCard, { downloadImage } from "./ImageCard";

import JSZip from "jszip";
import { saveAs } from "file-saver";
import firebase from "firebase/app";
import { AlertIcon } from "chakra-ui-ionicons";

export const downloadFolderAsZip = async (folderPath) => {
  const jszip = new JSZip();
  const folderRef = firebase.storage().ref(folderPath);
  const files = (await folderRef.listAll()).items;
  const downloadUrls = await Promise.all(
    files.map(({ name }) => folderRef.child(name).getDownloadURL())
  );
  const downloadedFiles = await Promise.all(
    downloadUrls.map((url) => fetch(url).then((res) => res.blob()))
  );
  downloadedFiles.forEach((file, i) => jszip.file(files[i].name, file));
  const content = await jszip.generateAsync({ type: "blob" });
  saveAs(content, folderPath);
};

const ImageGrid = ({ images, eventId, userId, userType }) => {
  console.log("imagegrid images", images);
  const { deleteDocument } = useFirestore("gallery");
  const [showSelectOption, setShowSelectOption] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const [zipProcessing, setZipProcessing] = useState(false);
  let selectedItems = [];
  if (images.length === 0) {
    return <div className="error">No images to load...</div>;
  }

  const deleteImage = (id) => {
    // projectFirestore.collection("gallery").doc(id).delete();
  };
  const showSelectImagesToast = () => {
    toast({
      title: "Select images to download",
      position: "top",
      isClosable: true,
      duration: 9000,
    });
  };
  const downloadImages = () => {
    if (selectedItems.length == 0) {
      showSelectImagesToast();
    }
    selectedItems.map((image) => {
      downloadImage(image.url, image.id);
    });
  };
  const deleteImages = () => {
    if (selectedItems.length == 0) {
      showSelectImagesToast();
    }
    selectedItems.map((image) => {
      if (image.createdBy == userId || userType == "Admin")
        deleteDocument(image.id);
      else
        toast({
          title: "You can delete only those images that you have uploaded!",
          position: "top",
          isClosable: true,
          duration: 9000,
        });
    });
  };
  const handleSelectImage = (image) => {
    if (image.selected == "selected") {
      if (selectedItems.filter((item) => item.id == image.id).length <= 0)
        selectedItems = [...selectedItems, image];
    } else if (image.selected == "deselected") {
      if (selectedItems.filter((item) => item.id == image.id).length > 0)
        selectedItems = selectedItems.filter((i) => {
          return i.id !== image.id;
        });
    }
    console.log(selectedItems);
  };
  return (
    // <div className="img-grid">
    //   {images &&
    //     images.map((doc) => (
    //       <motion.div
    //         className="img-wrap"
    //         key={doc.id}
    //         layout
    //         whileHover={{ opacity: 1 }}
    //         s
    //         onClick={() => setSelectedImg(doc.url)}
    //       >
    //         <motion.img
    //           src={doc.url}
    //           alt="uploaded pic"
    //           initial={{ opacity: 0 }}
    //           animate={{ opacity: 1 }}
    //           transition={{ delay: 1 }}
    //         />
    //       </motion.div>
    //     ))}
    // </div>
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
          Select Images
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
                    downloadImages();
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
                    deleteImages();
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
                      downloadFolderAsZip("gallery/" + eventId)
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

      <SRLWrapper>
        <Box
          as={motion.div}
          whileHover={{ opacity: 1 }}
          padding={4}
          w="100%"
          maxW="90%"
          mx="auto"
          sx={{ columnCount: [1, 2, 3], columnGap: "8px" }}
        >
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onSelectImage={handleSelectImage}
              showSelectOption={showSelectOption}
            ></ImageCard>
          ))}
        </Box>
      </SRLWrapper>
    </>
  );
};

export default ImageGrid;
