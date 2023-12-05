import React from "react";
import Menu from "../Menu";
 
const Header = ({ title, subtitle, headerImage }) => {
  return (
    <>
      {/* <!--header start--> */}
      <header id="masthead" className="header ttm-header-style-classic-overlay">
        <Menu></Menu>
      </header>
      {/* <!--header end--> */}
 
      <div
        className="ttm-page-title-row text-center"
         style={{backgroundImage: `url(${headerImage})`}} 
        
      >
        <div className="title-box text-center">
          <div className="container">
            <div className="page-title-heading">
              <h1 className="title">{title}</h1>
              <p className="ttm-textcolor-white">{subtitle}</p>
            </div>
            <div className="breadcrumb-wrapper">
              <div className="container">
                <span>
                  <a title="Homepage" href="index.html">
                    <i className="fa fa-home" />
                    &nbsp;&nbsp;Home
                  </a>
                </span>
                <span className="ttm-bread-sep ttm-textcolor-white">
                  {" "}
                  &nbsp; ⁄ &nbsp;
                </span>
                <span className="ttm-textcolor-white">About Us</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*header end*/}
    </>
  );
};

export default Header;
