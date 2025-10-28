import React from "react";
import UploadForm from "../components/UploadForm";
import ImageGrid from "../components/ImageGrid";
import { useState, useEffect } from "react";
import { projectFirestore } from "../firebase/config";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useCollection } from "../hooks/useCollection";
import { useEvent } from "../hooks/useEvent";
import VideoGrid from "../components/VideoGrid";
import { Box, chakra, Flex } from "@chakra-ui/react";
const Videos = () => {
 const { id } = useParams();
 const { userType } = useParams();
 const { user } = useAuthContext();
 console.log("user", user.uid);

  const { changeEvent } = useEvent();

  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(false);
  //const [error, setError] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);

  const { documents: videos, error } = useCollection(
    "videos",
    ["eventId", "==", id],
    ["createdAt", "desc"]
  );
  console.log(data);
  useEffect(() => {
    changeEvent(id);
  }, []);
  return (
    <Flex
      textAlign={"center"}
      pt={10}
      justifyContent={"center"}
      direction={"column"}
      width={"full"}
      overflow={"hidden"}
    >
      <Box width={{ base: "full", sm: "lg", lg: "xl" }} margin={"auto"}>
        {/* <chakra.h3
            fontFamily={"Work Sans"}
            fontWeight={"bold"}
            fontSize={20}
            textTransform={"uppercase"}
            color={"purple.400"}
          >
            {document.eventName}
          </chakra.h3> */}
        <chakra.h1
          py={5}
          fontSize={38}
          fontFamily={"Work Sans"}
          fontWeight={"bold"}
          color={"gray.700"}
        >
          Videos
        </chakra.h1>
      </Box>
      {error && <p className="error">{error}</p>}
      {isPending && <p className="loading">Loading...</p>}

      {/* <video src="https://firebasestorage.googleapis.com/v0/b/guestcam2-6896a.appspot.com/o/gallery%2FJw0WCBPkTg1FHpxNtTZV%2Fd0a0de88-c661-4726-8dc1-cfab015fb6b7.mov?alt=media&token=9352ca4a-3200-425c-8464-c1caafb0c61c"  width="750" height="500" controls></video> */}
      <UploadForm user={user}></UploadForm>
      {videos && (
        <VideoGrid
          videos={videos}
          eventId={id}
          userId={user.uid}
          userType={userType}
        />
      )}
    </Flex>
  );
};

export default Videos;
