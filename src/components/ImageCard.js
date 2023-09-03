import { Box, Image } from "@chakra-ui/react";
import React from "react";
import moment from "moment";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { IKImage, IKVideo, IKContext, IKUpload } from "imagekitio-react";
import { DownloadIcon } from "chakra-ui-ionicons";

const ImageCard = ({ image, setSelectedImg }) => {
  return (
    <Box className="img-container">
      <Box className="gallery-caption-left">
        <h1>
          by: <b>{image.createdByName}</b>{" "}
        </h1>
      </Box>
      <Box className="gallery-caption-right">
        <h1>
          <i>{moment(new Date(image.createdAt.seconds * 1000)).fromNow()}</i>
        </h1>
      </Box>
      <Box className="gallery-caption-right2">
        <a href={image.url} download target="_blank">
          <DownloadIcon w={8} h={8} color="black.500" />
        </a>
      </Box>
      <IKContext urlEndpoint="https://ik.imagekit.io/ppvclyjfm/">
        <IKImage
          path={image.url.replace(
            "https://firebasestorage.googleapis.com/v0/b/guestcam3-8cb1f.appspot.com",
            ""
          )}
          lqip={{ active: true, quality: 20 }}
        />
      </IKContext>
    </Box>
  );
};

export default ImageCard;
