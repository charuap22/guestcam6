import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { AuthContextProvider } from "./context/AuthContext";

// 1. import `ChakraProvider` component
import { ChakraProvider } from "@chakra-ui/react";
import { PlanProvider } from "./context/PlanContext";
import { EventProvider } from "./context/EventContext";
import { UserInfoProvider } from "./context/UserInfoContext";



ReactDOM.render(
  <React.StrictMode>
    <AuthContextProvider>
      <ChakraProvider>
          <PlanProvider>
            <EventProvider>
              <UserInfoProvider>
                <App />
              </UserInfoProvider>
            </EventProvider>
          </PlanProvider>
        
      </ChakraProvider>
    </AuthContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
