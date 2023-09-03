import { Box, Card, CardBody, Skeleton, SkeletonText } from "@chakra-ui/react";
import React from "react";
import moment from "moment";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

const ImageCardSkeleton = () => {
  return (
    <>
      {/* <Card width="300px" className="img-container">
        <Skeleton height="200px"></Skeleton>
        <CardBody>
          <SkeletonText></SkeletonText>
        </CardBody>
      </Card> */}
      <Card className="img-container">
        <Skeleton
          w="100%"
          height="300px"
        
          sx={{ display: "inline-block", position: "relative" }}
        ></Skeleton>
       
          <SkeletonText
            background={"rgba(225, 201, 64, 0.5)"}
            width={"150px"}
            position={"absolute"}
            zIndex={1}
            left={0}
            bottom={"55px"}
            padding={"10px"}
          ></SkeletonText>
        
      </Card>
    </>
  );
};

export default ImageCardSkeleton;
