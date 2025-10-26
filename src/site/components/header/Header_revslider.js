import React from "react";
import HeroKenburn from "../HeroKenburn";
import LoadScript from "../../helpers/LoadScript";
import Menu from "../Menu";

const Header_revslider = () => {
  LoadScript("./js/master.js");
  LoadScript("./js/main.js");
   
  return (
    <>
      {/* <!--header start--> */}
      <header id="masthead" className="header ttm-header-style-classic-overlay">
        <Menu></Menu>
        {/* <!--rev-slider --> */}
        <HeroKenburn></HeroKenburn>
        {/* <!--rev-slider end--> */}
      </header>
      {/* <!--header end--> */}
    </>
  );
};

export default Header_revslider;
