import React, { useState, useEffect } from "react";
import Header from "../components/header/Header";

import Footer from "../components/footer/Footer";
import bannerBg from "../images/party-crowd-background.jpg";
import GuestPovPricing from "../components/GuestPovPricing";
 
const PricingPage = () => {
 

  return (
    <>
      
        <Header
          title="PRICING"
          subtitle="Pricing"
          headerImage={bannerBg}
        ></Header>

        <div className="site-main">
  <GuestPovPricing></GuestPovPricing>
        </div>
        {/* site-main end */}
     
 

      <Footer />
    </>
  );
};

export default PricingPage;
