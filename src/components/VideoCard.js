import { Box, Checkbox, IconButton, Video } from "@chakra-ui/react";
import React, { useState } from "react";
import moment from "moment";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import { DownloadIcon } from "chakra-ui-ionicons";
import { CheckCircleIcon, CheckIcon, DeleteIcon } from "@chakra-ui/icons";
import ReactPlayer from "react-player";

export const downloadVideo = async (videoSrc, videoName) => {
  console.log("videoSrc", videoSrc);
  console.log("videoName", videoName);
  const VideoBlob = await fetch(videoSrc)
    .then((response) => response.arrayBuffer())
    .then((buffer) => new Blob([buffer], { type: "Video/jpeg" }));

  const link = document.createElement("a");
  link.href = URL.createObjectURL(VideoBlob);
  link.download = videoName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const VideoCard = ({ video, onSelectVideo, showSelectOption }) => {
  const [isSelected, setSelected] = useState(false);
  const ToggleSelected = (video) => {
    setSelected(!isSelected);
  };

  return (
    <Box className="img-container">
      <Box className="gallery-caption-left">
        <h1>
          by: <b>{video.createdByName}</b>{" "}
        </h1>
      </Box>
      <Box className="gallery-caption-right">
        <h1>
          <i>{moment(new Date(video.createdAt.seconds * 1000)).fromNow()}</i>
        </h1>
      </Box>
    
      {showSelectOption && (
        <CheckCircleIcon
          className={`gallery-caption-check ${
            isSelected ? "img-selected-check" : null
          }`}
          onClick={() => {
            ToggleSelected(video);
            if (!isSelected)
              onSelectVideo({
                id: video.id,
                selected: "selected",
                url: video.url,
                createdBy: video.createdBy,
              });
            else
              onSelectVideo({
                id: video.id,
                selected: "deselected",
                url: video.url,
                createdBy: video.createdBy,
              });
          }}
          w={8}
          h={8}
        ></CheckCircleIcon>
      )}

      <ReactPlayer
        width="100%"
        
        style={{ display: "inline-block" }}
        url={video.url}
        controls
      />
    </Box>
  );
};

export default VideoCard;
