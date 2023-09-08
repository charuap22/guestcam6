import React, { useState } from "react";
import useFirestore from "../hooks/useFirestore";
import { projectFirestore } from "../firebase/config";
// import Trashcan from "../assets/trashcan.svg";
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
} from "@chakra-ui/react";
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

const ImageGrid = ({ images, eventId }) => {
  const [showSelectOption, setShowSelectOption] = useState(false);
  const [error, setError] = useState(null);

  const [zipProcessing, setZipProcessing] = useState(false);
  let selectedItems = [];
  if (images.length === 0) {
    return <div className="error">No images to load...</div>;
  }

  const deleteImage = (id) => {
    projectFirestore.collection("gallery").doc(id).delete();
  };

  const downloadImages = () => {
    console.log("downloadimages");
    selectedItems.map((image) => {
      downloadImage(image.url, image.id);
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
      <Stack
        w="100%"
        maxW="90%"
        mx="auto"
        px={4}
        spacing={4}
        direction="row"
        align="center"
      >
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
            setShowSelectOption(!showSelectOption);
          }}
        >
          Select
        </Button>
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
            downloadImages();
          }}
        >
          Download
        </Button>
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
          onClick={() => {}}
        >
          Delete
        </Button>
        {!zipProcessing && (
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
            isLoading
            loadingText="Processing"
            px={2}
            bg={"#151f21"}
            color={"white"}
            width={"100%"}
            rounded={"md"}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
          >
            Processing
          </Button>
        )}
      </Stack>

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
