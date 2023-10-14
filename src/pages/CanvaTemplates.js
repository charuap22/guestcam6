import React, { useState } from "react";

import TCT_DigitalGuestbook_10x15cm from "../assets/canva/TCT_DigitalGuestbook_10x15cm.jpg";
import TCT_ISpy_10x15 from "../assets/canva/TCT_ISpy_10x15.jpg";
import TCT_Sharethelove_10x15cm from "../assets/canva/TCT_Sharethelove_10x15cm.jpg";
import TCT_Capturethelove_10x15cm from "../assets/canva/TCT_Capturethelove_10x15cm.jpg";

import TCT_DigitalGuestbook_10x10cm from "../assets/canva/TCT_DigitalGuestbook_10x10cm.jpg";
import TCT_ISpy_10x10cm from "../assets/canva/TCT_ISpy_10x10cm.jpg";
import TCT_Sharethelove_10x10cm from "../assets/canva/TCT_Sharethelove_10x10cm.jpg";
import TCT_Capturethelove_10x10cm from "../assets/canva/TCT_Capturethelove_10x10cm.jpg";

import PS_DigitalGuestbook_20x20cm from "../assets/canva/PS_DigitalGuestbook_20x20cm.jpg";
import PS_ISpy_20x20cm from "../assets/canva/PS_ISpy_20x20cm.jpg";
import PS_Sharethelove_20x20cm from "../assets/canva/PS_Sharethelove_20x20cm.jpg";
import PS_Capturethelove_20x20cm from "../assets/canva/PS_Capturethelove_20x20cm.jpg";

import ST_DigitalGuestbook_50x65cm from "../assets/canva/ST_DigitalGuestbook_50x65cm.jpg";
import ST_ISpy_50x65cm from "../assets/canva/ST_ISpy_50x65cm.jpg";
import ST_Sharethelove_50x65cm from "../assets/canva/ST_Sharethelove_50x65cm.jpg";
import ST_Capturethelove_50x65cm from "../assets/canva/ST_Capturethelove_50x65cm.jpg";

import BusinessCard_Capturethelove from "../assets/canva/BusinessCard_Capturethelove.jpg";
import BusinessCard_ISpy from "../assets/canva/BusinessCard_ISpy.jpg";
import BusinessCard_Sharethelove from "../assets/canva/BusinessCard_Sharethelove.jpg";
import BusinessCard_vertical_Capturethelove from "../assets/canva/BusinessCard_vertical_Capturethelove.jpg";
import BusinessCard_vertical_DigitalGuestbook from "../assets/canva/BusinessCard_vertical_Capturethelove.jpg";

import { Box, Flex, Image, Link, SimpleGrid, chakra } from "@chakra-ui/react";
import { useParams } from "react-router-dom";

const CanvaTemplates = () => {
  const { type } = useParams();
  const [error, setError] = useState(false);

  const srces_10x15_1s = [
    {
      image: TCT_DigitalGuestbook_10x15cm,
      link: "https://www.canva.com/design/DAFwED47owY/D_EQAQPw4QFSJtSQHtmIwA/edit?utm_content=DAFwED47owY&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
    {
      image: TCT_Sharethelove_10x15cm,
      link: "https://www.canva.com/design/DAFwDt0bFVY/3opbeQWz4WqjxSIx0p-ySA/edit?utm_content=DAFwDt0bFVY&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
    {
      image: TCT_Capturethelove_10x15cm,
      link: "https://www.canva.com/design/DAFvx4LBJ0c/OiMroKQ39TE-UjL86ptFqw/edit?utm_content=DAFvx4LBJ0c&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
  ];
  const srces_10x15_2s = [
    {
      image: TCT_ISpy_10x15,
      link: "https://www.canva.com/design/DAFv30FD7Zo/VI60mZSpg4OvBMwWq2YSTg/edit?utm_content=DAFv30FD7Zo&utm_campaign=designshare&utm_medium=link2&utm_source=sharebuttont",
    },
  ];
  const srces_10x10_1s = [
    {
      image: TCT_DigitalGuestbook_10x10cm,
      link: "https://www.canva.com/design/DAFwEO0263U/jtMmQPZGexsrqfBUbw-PQg/edit?utm_content=DAFwEO0263U&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
    {
      image: TCT_Sharethelove_10x10cm,
      link: "https://www.canva.com/design/DAFwDqqZDhk/MI0kPyU3HsCP_27qhB8CrA/edit?utm_content=DAFwDqqZDhk&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
    {
      image: TCT_Capturethelove_10x10cm,
      link: "https://www.canva.com/design/DAFvx3noxec/-2Ytgev1YFQsS324ZFlJ6A/edit?utm_content=DAFvx3noxec&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
  ];
  const srces_10x10_2s = [
    {
      image: TCT_ISpy_10x10cm,
      link: "https://www.canva.com/design/DAFv-y1jQ-U/FKzmu9-bFkyAYQS4FFzOkg/edit?utm_content=DAFv-y1jQ-U&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
  ];

  const srces_20x20_1s = [
    {
      image: PS_DigitalGuestbook_20x20cm,
      link: "https://www.canva.com/design/DAFwEG9_x5Y/Zwwsnso54enJidCMyutNlg/edit?utm_content=DAFwEG9_x5Y&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
    {
      image: PS_Sharethelove_20x20cm,
      link: "https://www.canva.com/design/DAFwDwReJb8/WpLkcNgRlzH4K-SNnJjfSg/edit?utm_content=DAFwDwReJb8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
    {
      image: PS_Capturethelove_20x20cm,
      link: "https://www.canva.com/design/DAFvx1h2nUo/PWg-coPJ2qRQEpBXeLdM0A/edit?utm_content=DAFvx1h2nUo&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
  ];
  const srces_20x20_2s = [
    {
      image: PS_ISpy_20x20cm,
      link: "https://www.canva.com/design/DAFv_EsMGbI/DwLhEi3SFAi5nywX3Mlf-w/edit?utm_content=DAFv_EsMGbI&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
  ];
  const srces_50x65_1s = [
    {
      image: ST_DigitalGuestbook_50x65cm,
      link: "https://www.canva.com/design/DAFwEJNwKTo/BVpQXrFy19iqnJh9NTT9Jw/edit?utm_content=DAFwEJNwKTo&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
    {
      image: ST_Sharethelove_50x65cm,
      link: "https://www.canva.com/design/DAFwDr7ODHI/S0oiNIVFJbvcO13w7hXOEg/edit?utm_content=DAFwDr7ODHI&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
    {
      image: ST_Capturethelove_50x65cm,
      link: "https://www.canva.com/design/DAFvx_3DmbM/yn07R65qHUjKGpAr6tfr-A/edit?utm_content=DAFvx_3DmbM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
  ];
  const srces_50x65_2s = [
    {
      image: ST_ISpy_50x65cm,
      link: "https://www.canva.com/design/DAFv_J2O6D0/mOFLXlUaQmA2-XcBJwOMuQ/edit?utm_content=DAFv_J2O6D0&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
  ];
  const srces_BusinessCard_1s = [
    {
      image: BusinessCard_vertical_Capturethelove,
      link: "https://www.canva.com/design/DAFvx3PP33k/ZVtjxYUh-4CPKnJO7skOOg/edit?utm_content=DAFvx3PP33k&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
    {
      image: BusinessCard_Sharethelove,
      link: "https://www.canva.com/design/DAFwD0uZrOk/O1ec40SZ-t4YqxtGEhyiVw/edit?utm_content=DAFwD0uZrOk&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
    {
      image: BusinessCard_Capturethelove,
      link: "https://www.canva.com/design/DAFvxzQShEg/UcLP39IhE-JIhiwGNWOeSg/edit?utm_content=DAFvxzQShEg&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
    ,
    {
      image: BusinessCard_vertical_DigitalGuestbook,
      link: "https://www.canva.com/design/DAFwEDrCuag/1XuEc_n9Q6KBmVaksoqL6A/edit?utm_content=DAFwEDrCuag&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
  ];
  const srces_BusinessCard_2s = [
    {
      image: BusinessCard_ISpy,
      link: "https://www.canva.com/design/DAFv-9wO304/3BgJUySccAuDVZ4Eda7ocQ/edit?utm_content=DAFv-9wO304&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
  ];
  let srces_1sided = [];
  let srces_2sided = [];
  let title = "";

  if (type == "10x15") {
    srces_1sided = srces_10x15_1s;
    srces_2sided = srces_10x15_2s;
    title = "Table Card Template (10 x 15 cm)";
  } else if (type == "20x20") {
    srces_1sided = srces_20x20_1s;
    srces_2sided = srces_20x20_2s;
    title = "Photobooth Signage (20 x 20 cm)";
  } else if (type == "10x10") {
    srces_1sided = srces_10x10_1s;
    srces_2sided = srces_10x10_2s;
    title = "Table Card Template (10 x 10 cm)";
  } else if (type == "50x65") {
    srces_1sided = srces_50x65_1s;
    srces_2sided = srces_50x65_2s;
    title = "Signage Template (50 x 65 cm)";
  } else if (type == "BusinessCard") {
    srces_1sided = srces_BusinessCard_1s;
    srces_2sided = srces_BusinessCard_2s;
  } else if (type == "Business Cards") {
    title = "";
  }
  return (
    <>
      <Flex
        textAlign={"center"}
        pt={10}
        justifyContent={"center"}
        direction={"column"}
        width={"full"}
        overflow={"hidden"}
      >
        <Box width={{ base: "full", sm: "lg", lg: "xl" }} margin={"auto"}>
          <chakra.h3
            fontFamily={"Work Sans"}
            fontWeight={"bold"}
            fontSize={20}
            textTransform={"uppercase"}
            color={"purple.400"}
          >
            {document.eventName}
          </chakra.h3>{" "}
          <chakra.h1
            py={5}
            fontSize={38}
            fontFamily={"Work Sans"}
            fontWeight={"bold"}
            color={"gray.700"}
          >
            Canva Templates
          </chakra.h1>
        </Box>
        {error && <p className="error">{error}</p>}
        <SimpleGrid
          columns={{ sm: 1, md: 2, lg: 3, xl: 3 }}
          padding={"10px"}
          spacing={10}
          w="100%"
          maxW="90%"
          mx="auto"
        >
          {srces_1sided.map((src) => (
            <Link href={src.link} isExternal>
              <Image
                key={src.image}
                w="100%"
                borderRadius="xl"
                mb={2}
                d="inline-block"
                src={src.image}
                alt="Alt"
              />
            </Link>
          ))}
        </SimpleGrid>
        <SimpleGrid
          columns={{ sm: 1, md: 2, lg: 2, xl: 2 }}
          padding={"10px"}
          spacing={10}
          w="100%"
          maxW="90%"
          mx="auto"
        >
          {srces_2sided.map((src) => (
            <Link href={src.link} isExternal>
              <Image
                key={src.image}
                w="100%"
                borderRadius="xl"
                mb={2}
                d="inline-block"
                src={src.image}
                alt={src.image}
              />
            </Link>
          ))}
        </SimpleGrid>
      </Flex>
    </>
  );
};

export default CanvaTemplates;
