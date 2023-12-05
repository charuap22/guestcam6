import React, { useState, useEffect } from "react";
import { usePlan } from "../hooks/usePlan";
import { useCollection } from "../hooks/useCollection";
import { projectFirestore } from "../firebase/config";
import { Box, Heading, HStack, Text } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";

const GetPackageInfo = () => {
  //const { error, documents } = useCollection("plans", ["id", "==", plan]);
  // let history = useHistory();
  // if (!plan) history.push(`/login`);
  // console.log(plan);
 const { plan } = usePlan();
 console.log("plan", plan);
 
 
  if (!plan ) {
    return <div className="loading">Loading...</div>;
  }
  return (
    
    <Box>
    
      <HStack>
        <Heading fontSize={"18px"}  fontFamily={"body"}>
          {plan.Name} ${plan.Price} USD 
        </Heading>
      </HStack>
      <Text fontWeight={600} color={"gray.500"} mb={4}>
        {plan.NoOfGuests_start}-{plan.NoOfGuests_end} Guests
      </Text>
    </Box>
  );
};

export default GetPackageInfo;
