import React from "react";
import useFirestore from "../hooks/useFirestore";
import { projectFirestore } from "../firebase/config";
// import Trashcan from "../assets/trashcan.svg";
import { motion } from "framer-motion";
import { Avatar, Box, Image, Link, Stack, Text } from "@chakra-ui/react";
import { SRLWrapper } from "simple-react-lightbox";

import ImageCard from "./ImageCard";

const ImageGrid = ({ images, setSelectedImg }) => {
  console.log("images", images);
  if (images.length === 0) {
    return <div className="error">No images to load...</div>;
  }

  const handleClick = (id) => {
    projectFirestore.collection("gallery").doc(id).delete();
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
              setSelectedImg={setSelectedImg}
            ></ImageCard>
          ))}
        </Box>
      </SRLWrapper>
    </>
  );
};

export default ImageGrid;
