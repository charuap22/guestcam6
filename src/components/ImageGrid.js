import React, { useState } from "react";
import useFirestore from "../hooks/useFirestore";
import { projectFirestore } from "../firebase/config";
// import Trashcan from "../assets/trashcan.svg";
import { motion } from "framer-motion";
import {
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

const ImageGrid = ({ images }) => {
  const [showSelectOption, setShowSelectOption] = useState(false);

  let selectedItems = [];
  if (images.length === 0) {
    return <div className="error">No images to load...</div>;
  }

  const deleteImage = (id) => {
    projectFirestore.collection("gallery").doc(id).delete();
  };

  const downloadImages = () => {
    console.log('downloadimages')
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
          Download All as Zip
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
          Select All
        </Button>
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
