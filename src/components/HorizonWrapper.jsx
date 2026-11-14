// src/components/HorizonWrapper.jsx
import React, { useEffect } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../theme/horizonTheme"; // adjust path if needed

export default function HorizonWrapper({ children }) {
  // Inject Inter font only when this wrapper is mounted
  useEffect(() => {
    const id = "horizon-inter-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(link);
      return () => {
        // optionally remove the font link on unmount
        // document.head.removeChild(link);
      };
    }
  }, []); 

  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
