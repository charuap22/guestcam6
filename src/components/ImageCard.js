import { Box, Checkbox, IconButton, Image } from "@chakra-ui/react";
import React, { useState } from "react";
import moment from "moment";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { IKImage, IKVideo, IKContext, IKUpload } from "imagekitio-react";
import { DownloadIcon } from "chakra-ui-ionicons";
import { CheckCircleIcon, CheckIcon, DeleteIcon } from "@chakra-ui/icons";

export const downloadImage = async (imageSrc, imageName) => {
  console.log("imageSrc", imageSrc);
  console.log("imageName", imageName);
  const imageBlob = await fetch(imageSrc)
    .then((response) => response.arrayBuffer())
    .then((buffer) => new Blob([buffer], { type: "image/jpeg" }));

  const link = document.createElement("a");
  link.href = URL.createObjectURL(imageBlob);
  link.download = imageName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ImageCard = ({ image, onSelectImage, showSelectOption }) => {
  const [isSelected, setSelected] = useState(false);
  const ToggleSelected = (image) => {
    setSelected(!isSelected);
  };
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
        <IconButton
          onClick={() => {
            downloadImage(image.url, image.id);
          }}
          icon={<DownloadIcon w={8} h={8} color="black.500" />}
        ></IconButton>
        <IconButton
          icon={<DeleteIcon w={8} h={8} color="black.500" />}
        ></IconButton>
        <IconButton
          icon={<CheckIcon w={8} h={8} color="black.500" />}
        ></IconButton>
      </Box>
      {/* <Checkbox
        className="gallery-caption-check"
        iconSize="5rem"
        colorScheme="yellow"
        defaultChecked
      ></Checkbox> */}
      {showSelectOption && (
        <CheckCircleIcon
          className={`gallery-caption-check ${
            isSelected ? "img-selected-check" : null
          }`}
          onClick={() => {
            ToggleSelected(image);
            if (!isSelected)
              onSelectImage({ id: image.id, selected: "selected" , url: image.url});
            else onSelectImage({
              id: image.id,
              selected: "deselected",
              url: image.url
            });
          }}
          w={8}
          h={8}
        ></CheckCircleIcon>
          )}

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
