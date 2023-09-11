import React, { useEffect, useState } from "react";
import useGalleryUpload from "../hooks/useGalleryUpload";
import { motion } from "framer-motion";
import { Progress,Box,Center,Text, CircularProgress, CircularProgressLabel } from "@chakra-ui/react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useEvent } from "../hooks/useEvent";
import { useParams } from "react-router-dom";
import Resizer from "react-image-file-resizer";

export const ProgressBar = ({ file,fileurl, user, fileType }) => {
  //const { eventId } = useEvent();

  const { progress, url } = useGalleryUpload(file, user, fileType);
  const [uploadDone, setUploadDone] = useState(false);
  console.log(progress, url);
 const [avatarImg, setAvatarImg] = useState(null);

 
  useEffect(() => {
    setUploadDone(false);
    if (url) {
      setUploadDone(true);
      
    }
  }, [url, fileurl]);

  return (
    <>
      {
        progress!==100 && (
          <>
            {/* <Box w="100%">
            <Center>
              <Text key={file.name}>{file.name}</Text>
            </Center>
          </Box>
          <Progress
            width="80%"
            colorScheme="green"
            size="sm"
            value=
          /> */}
            <Box
              w={"200px"}
              height={"200px"}
              backgroundImage={`url(${fileurl})`}
              backgroundSize={"cover"}
              backgroundPosition={"center center"}
            >
              <CircularProgress
                size="100px"
                marginTop={"40px"}
                value={progress}
                color="green.400"
              >
                <CircularProgressLabel color={"white"}>
                  {progress}
                </CircularProgressLabel>
              </CircularProgress>
            </Box>
          </>
        )}
    </>
    // <>
    //   <div className="progress-bar" style={{ width: progress + "%" }}></div>
    //
    // </>
  );
};
