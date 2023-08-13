import React from "react";
import useFirestore from "../hooks/useFirestore";
import { projectFirestore } from "../firebase/config";
// import Trashcan from "../assets/trashcan.svg";
import { motion } from "framer-motion";
import { Avatar, Box, Image, Link, Stack, Text } from "@chakra-ui/react";
import { SRLWrapper } from "simple-react-lightbox";
import moment from "moment";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

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
          {images.map((doc) => (
            <Box className="img-container" key={doc.id}>
              <Box className="gallery-caption-left">
                <h1>
                  by: <b>{doc.createdByName}</b>{" "}
                </h1>
              </Box>
              <Box className="gallery-caption-right">
                <h1>
                  <i>
                    {moment(new Date(doc.createdAt.seconds * 1000)).fromNow()}
                  </i>
                </h1>
              </Box>

              <Image
                // as={motion.img}
                // initial={{ opacity: 0 }}
                // animate={{ opacity: 1 }}
                // transition={{ delay: 1 }}
                w="100%"
                key={doc.id}
                mb={2}
                d="inline-block"
                src={doc.url.replace(
                  "https://firebasestorage.googleapis.com/v0/b/guestcam2-6896a.appspot.com",
                  "https://ik.imagekit.io/ppvclyjfm/"
                )}
                alt={
                  "by: " +
                  doc.createdByName +
                  formatDistanceToNow(doc.createdAt.toDate(),{addSuffix: true})
                  //moment(new Date(doc.createdAt.seconds * 1000)).fromNow()
                }
                 sx={{transform: `scale(1)`,	transition: `.3s ease-in-out`}}
                _hover={{ transform: `scale(1.3)` }}
                onClick={() => setSelectedImg(doc.url)}
              />
            </Box>
          ))}
        </Box>
      </SRLWrapper>
    </>
  );
};

export default ImageGrid;
