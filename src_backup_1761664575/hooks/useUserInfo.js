import { useContext } from "react";
import { UserInfoContext } from "../context/UserInfoContext";

export const useUserInfo = () => {
  const context = useContext(UserInfoContext);

  if (context === undefined) {
    throw new Error("useUserInfo() must be used inside a UserInfoProvider");
  }

  return context;
};
