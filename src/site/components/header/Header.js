import React, { useEffect, useState } from "react";
import Menu from "../Menu";

const Header = ({ title, subtitle, headerImage }) => {
  const [offset, setOffset] = useState(0);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setOffset(scrollY * 0.4);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* <!-- Header start --> */}
      <header id="masthead" className="header ttm-header-style-classic-overlay">
        <Menu />
      </header>
      {/* <!-- Header end --> */}

      {/* Page title with parallax background */}
      <div
        className="ttm-page-title-row text-center"
        style={{
          backgroundImage: `url(${headerImage})`,
          backgroundPositionY: `${offset}px`,
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          position: "relative",
          overflow: "hidden",
          transition: "background-position 0.2s ease-out",
        }}
      >
        {/* Overlay for contrast */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            zIndex: 1,
          }}
        ></div>

        {/* Content */}
        <div
          className="title-box text-center"
          style={{
            position: "relative",
            zIndex: 2,
            padding: "120px 0 100px 0",
            color: "#fff",
            animation: "fadeIn 1.2s ease forwards",
            opacity: 0,
          }}
        >
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>

          <div className="container">
            <div className="page-title-heading">
              <h1
                className="title"
                style={{
                  color: "#e6c250",
                  fontWeight: "700",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontSize: "3rem",
                }}
              >
                {title}
              </h1>
              <p
                className="ttm-textcolor-white"
                style={{
                  color: "#f5f5f5",
                  fontSize: "1.2rem",
                  marginTop: "10px",
                  fontWeight: "400",
                }}
              >
                {subtitle}
              </p>
            </div>

            {/* Breadcrumb */}
            <div className="breadcrumb-wrapper" style={{ marginTop: "25px" }}>
              <div className="container">
                <span>
                  <a
                    title="Homepage"
                    href="/"
                    style={{
                      color: "#e6c250",
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    <i className="fa fa-home" />
                    &nbsp;&nbsp;Home
                  </a>
                </span>
                <span
                  className="ttm-bread-sep ttm-textcolor-white"
                  style={{ color: "#fff" }}
                >
                  {" "}
                  &nbsp; ⁄ &nbsp;
                </span>
                <span
                  className="ttm-textcolor-white"
                  style={{ color: "#f5f5f5" }}
                >
                  {subtitle}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <!--header end--> */}
    </>
  );
};

export default Header;
