import React from "react";
import useFirestore from "../hooks/useFirestore";
import { projectFirestore } from "../firebase/config";
// import Trashcan from "../assets/trashcan.svg";
import { motion } from "framer-motion";
import { Avatar, Box, Image, Link, Stack, Text } from "@chakra-ui/react";
import { SRLWrapper } from "simple-react-lightbox";
import moment from "moment";
import { AspectRatio } from "@chakra-ui/react";
import ReactPlayer from "react-player";

const VideoGrid = ({ videos, setSelectedImg }) => {
  console.log("videos", videos);
  if (videos.length === 0) {
    return <div className="error">No videos to load...</div>;
  }

  const handleClick = (id) => {
    projectFirestore.collection("videos").doc(id).delete();
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
        padding={4}
        w="100%"
        maxW="90%"
        mx="auto"
        // bg="gray.800"
        sx={{ columnCount: [1, 2, 3], columnGap: "8px" }}
      >
        {videos.map((doc) => (
          // <Image
          //   key={doc.url}
          //   w="100%"
          //   borderRadius="xl"
          //   mb={2}
          //   d="inline-block"
          //   src={doc.url}
          //   alt="Alt"
          // />
          <ReactPlayer
            width="100%"
            style={{ display: "inline-block" }}
            url={doc.url}
            controls
          />
        ))}
      </Box>
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
