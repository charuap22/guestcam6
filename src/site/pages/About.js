import React, { useState, useEffect } from "react";
import Header from "../components/header/Header";
import bannerBg from "../images/party-crowd-background.jpg";
import qrcode from "../images/feature-icons/qr.png";
import upload from "../images/feature-icons/upload.png";
import gallery from "../images/feature-icons/gallery.png";
import slideshow from "../images/feature-icons/slideshow.png";
import highres from "../images/feature-icons/camera.png";
import storage from "../images/feature-icons/unlimited-storage.png";
import calendar from "../images/feature-icons/calendar.png";
import download from "../images/feature-icons/download.png";
import guestbook from "../images/feature-icons/guestbook.png";

import guestbook2 from "../images/funways/guestbook3.jpg";
import ISpy from "../images/funways/ISpy.jpg";
import photobooth from "../images/funways/photobooth2.jpg";
import slideshow2 from "../images/funways/slideshow.jpg";

import createEvent from "../images/tabs/createEvent.png";

import Footer from "../components/footer/Footer";


const feature = {
  backgroundColor: "#e6c25000",
};
const About = () => {
  const [tabsToggle, setTabsToggle] = useState(1);
  function updateTabsToggleId(id) {
    setTabsToggle(id);
  }

  useEffect(() => {
    const elements = document.querySelectorAll(".fade-in-on-scroll");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <>
        <Header
          title="ABOUT US"
          subtitle="About GuestPOV"
          headerImage={bannerBg}
        ></Header>

        <div className="site-main">
          {/* about-intro-section */}
          {/* <!--intro-section start--> */}
          <section className="ttm-row welcome-section clearfix ttm-bgcolor-white fade-in-on-scroll">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-lg-6 fade-in-on-scroll">
                  <div className="ttm_single_image_wrapper mt_20 res-991-mt-0">
                    <img
                      src="images/about-2.png"
                      alt="image"
                      className="img-fluid"
                    />
                  </div>
                </div>
                <div className="col-md-12 col-lg-6 fade-in-on-scroll">
                  <div className="row">
                    <div className="col-md-12 col-lg-12">
                      <div className="pt-40 res-991-pt-30">
                        <div className="section-title">
                          <h2 className="title">About GUESTPOV</h2>
                          <p className="mb-25">
                            <strong>
                              At GuestPov, we understand that every event is
                              built on moments—some planned, some spontaneous,
                              but all unforgettable. While professional
                              photography captures the highlights, the true
                              essence of your celebration is found in the candid
                              perspectives of your guests.
                            </strong>
                          </p>
                        </div>
                        <div className="mt_19 mb-30 pr-35">
                          <p>
                            GuestPov is a simple, secure, and accessible online
                            photo and video sharing platform that allows you to
                            collect memories from every angle. Whether it’s a
                            wedding, corporate event, or private celebration,
                            your guests can instantly share their photos and
                            videos without the need for downloads or complicated
                            setups.
                          </p>
                        </div>
                        <div className="mt_19 mb-30 pr-35">
                          <p>
                            Our goal is to ensure you{" "}
                            <b>never miss a moment.</b> With GuestPov, you’ll
                            enjoy:
                            <ul>
                              <li>One place for every guest’s memories</li>
                              <li>
                                Authentic perspectives from the people who
                                matter most
                              </li>
                              <li>
                                A beautifully organized gallery you can revisit
                                and share forever
                              </li>
                            </ul>{" "}
                            <br></br>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* <!--intro-section end--> */}

          {/* what we do-section  */}
          <section
            className="service-section style2 bg-layer-equal-height fade-in-on-scroll"
            style={{
              width: "100%",
            }}
          >
            <div
              className="row"
              style={{
                margin: 0,
                display: "flex",
                alignItems: "stretch",
                flexWrap: "wrap",
              }}
            >
              {/* LEFT IMAGE */}
              <div
                className="col-lg-6 col-md-12 fade-in-on-scroll"
                style={{
                  padding: 0,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src={require("../images/howitworks/3.jpg")}
                  alt="Step 3"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.6s ease",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "scale(1.03)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(180deg, rgba(230,194,80,0.25) 0%, rgba(230,194,80,0.1) 100%)",
                    pointerEvents: "none",
                  }}
                ></div>
              </div>

              {/* RIGHT TEXT SIDE */}
              <div
                className="col-lg-6 col-md-12 fade-in-on-scroll d-flex align-items-center"
                style={{
                  background:
                    "linear-gradient(145deg, #fffefa 0%, #fff3d9 100%)",
                  padding: "60px 80px",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)",
                }}
              >
                <div className="section-title with-desc clearfix">
                  {/* HEADER */}
                  <div className="title-header mb-4">
                    <h4
                      style={{
                        color: "#b99a2a",
                        letterSpacing: "2.5px",
                        fontWeight: 600,
                        fontSize: "24px",
                        textTransform: "uppercase",
                        marginBottom: "30px",
                        opacity: 0.9,
                      }}
                    >
                      — What We Do —
                    </h4>
                    <h2
                      style={{
                        fontSize: "28px",
                        fontWeight: "700",
                        color: "#000",
                        lineHeight: "1.4",
                        marginBottom: "20px",
                      }}
                    >
                      Capture Every Guest’s Perspective
                    </h2>
                  </div>

                  {/* BODY TEXT */}
                  <p
                    style={{
                      fontSize: "17px",
                      color: "#333",
                      lineHeight: "1.8",
                    }}
                  >
                    <b style={{ color: "#000" }}>
                      GuestPov delivers a local, streamlined solution designed
                      to make memory-sharing effortless.
                    </b>
                  </p>

                  <p
                    style={{
                      fontSize: "16px",
                      color: "#444",
                      lineHeight: "1.8",
                    }}
                  >
                    And here’s something we’re especially proud of:{" "}
                    <b style={{ color: "#000" }}>
                      GuestPov is Canadian-owned and based right here in British
                      Columbia.
                    </b>{" "}
                    That means when you use our platform, you’re supporting a
                    homegrown company that’s built for our communities and
                    events.
                  </p>

                  <p
                    style={{
                      fontSize: "16px",
                      color: "#444",
                      lineHeight: "1.8",
                    }}
                  >
                    Because the best part of any event isn’t just what you see —
                    it’s how your guests see it, too.
                  </p>

                  {/* DIVIDER */}
                  <div
                    style={{
                      width: "80px",
                      height: "2px",
                      background: "#e6c250",
                      margin: "30px 0",
                      opacity: 0.8,
                    }}
                  ></div>

                  {/* BOTTOM TAGLINE */}
                  <div
                    className="row mt-4"
                    style={{
                      textAlign: "center",
                      justifyContent: "center",
                      marginTop: "40px",
                      gap: "0px",
                    }}
                  >
                    <div
                      className="col-6 mt-40"
                      style={{
                        transform: "translateY(0)",
                        transition: "transform 0.3s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "translateY(-4px)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                      }
                    >
                      <h3
                        style={{
                          background:
                            "linear-gradient(90deg, #d4b037 0%, #e6c250 50%, #f8e391 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontWeight: "900",
                          fontSize: "28px",
                          marginBottom: "6px",
                          letterSpacing: "1px",
                        }}
                      >
                        NO APP.
                      </h3>
                      <p
                        style={{
                          color: "#555",
                          fontSize: "15px",
                          marginBottom: 0,
                        }}
                      >
                        Access from any device instantly.
                      </p>
                    </div>

                    <div
                      className="col-6 mt-40"
                      style={{
                        transform: "translateY(0)",
                        transition: "transform 0.3s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "translateY(-4px)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                      }
                    >
                      <h3
                        style={{
                          background:
                            "linear-gradient(90deg, #d4b037 0%, #e6c250 50%, #f8e391 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontWeight: "900",
                          fontSize: "28px",
                          marginBottom: "6px",
                          letterSpacing: "1px",
                        }}
                      >
                        NO FUSS.
                      </h3>
                      <p
                        style={{
                          color: "#555",
                          fontSize: "15px",
                          marginBottom: 0,
                        }}
                      >
                        Simple sharing, no downloads.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FUN WAYS TO USE-section */}
          <section className="ttm-row about-team-section clearfix fade-in-on-scroll">
            <div className="container">
              <div className="row text-center">
                <div className="col-lg-12">
                  <div className=" section-title clearfix">
                    <h4>FUN WAYS TO USE</h4>
                    <h2 className="title">GUESTPOV at your event</h2>
                    <div className="title-img">
                      <img src="images/ds-1.png" alt="underline-img" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 col-lg-6 mb-30">
                  <div className="featured-imagebox featured-imagebox-team ttm-team-box-view-overlay">
                    <div className="featured-thumbnail">
                      <img className="img-fluid" src={slideshow2} />
                    </div>
                    <div className="featured-content featured-content-team">
                      <div className="featured-title">
                        <h5>Live Photo Slideshow</h5>
                        <br></br>
                      </div>
                      <span className="category">
                        Activate the live photo slideshow feature and watch as
                        photos are automatically added for everyone to enjoy!
                        It's a fabulous way to showcase every angle of your
                        event.{" "}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-6 mb-30">
                  <div className="featured-imagebox featured-imagebox-team ttm-team-box-view-overlay">
                    <div className="featured-thumbnail">
                      <img className="img-fluid" src={photobooth} />
                    </div>
                    <div className="featured-content featured-content-team">
                      <div className="featured-title">
                        <h5>DIY Photo Booth</h5>
                        <br></br>
                      </div>
                      <span className="category">
                        The one stall that can amuse people of all ages is the
                        photo booth where the guests and the couple can pose
                        using various props and materials and get funky,
                        carefree, and beautiful photos clicked. Have guests
                        upload all the antics to your GUESTPOV gallery.
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-6 mb-30">
                  <div className="featured-imagebox featured-imagebox-team ttm-team-box-view-overlay">
                    <div className="featured-thumbnail">
                      <img className="img-fluid" src={guestbook2} />
                    </div>
                    <div className="featured-content featured-content-team">
                      <div className="featured-title">
                        <h5>Digital Guestbook</h5>
                        <br></br>
                      </div>
                      <span className="category">
                        Allow your guests to leave their well wishes and special
                        messages. Elevate your event décor and ensure your
                        guests don’t miss your guest book by displaying a "sign
                        our guest book" beside it. We have put together some
                        ideas to inspire you as you personalise your guest book
                        sign.
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-6 mb-30">
                  <div className="featured-imagebox featured-imagebox-team ttm-team-box-view-overlay">
                    <div className="featured-thumbnail">
                      <img className="img-fluid" src={ISpy} />
                    </div>
                    <div className="featured-content featured-content-team">
                      <div className="featured-title">
                        <h5>Guest Challenge</h5>
                        <br></br>
                      </div>
                      <span className="category">
                        At GuestPov, we understand that every event is built on
                        moments—some planned, some spontaneous, but all
                        unforgettable. While professional photography captures
                        the highlights, the true essence of your celebration is
                        found in the candid perspectives of your guests.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* FUN WAYS TO USE-section END */}
          {/* service-process-section2 */}
          <section className="ttm-row ttm-bgcolor-white service-process-section2 clearfix fade-in-on-scroll">
            <div className="container">
              <div className="row text-center">
                <div className="col-lg-12">
                  <div className=" section-title clearfix">
                    <h4>OUR BEST FEATURES</h4>
                    <h2 className="title">With GUESTPOV you can</h2>
                    <div className="title-img">
                      <img src="images/ds-1.png" alt="underline-img" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-3">
                  <div className="featured-box text-center res-991-mt-20">
                    <div className="icon-outline-border">
                      <div className="featured-icon">
                        <div
                          style={feature}
                          className="ttm-icon ttm-icon_element-size-lg ttm-icon_element-fill ttm-icon_element-background-skincolor ttm-icon_element-style-rounded"
                        >
                          <img src={qrcode} />
                        </div>
                      </div>
                      <div className="featured-title">
                        <h5> Setup your event in seconds</h5>
                        <p>
                          Create your event, generate a QR code and link in a
                          few seconds. Share the QR Code or link with your
                          guests.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="featured-box text-center res-991-mt-20">
                    <div className="icon-outline-border">
                      <div className="featured-icon">
                        <div
                          style={feature}
                          className="ttm-icon ttm-icon_element-size-lg ttm-icon_element-fill ttm-icon_element-background-skincolor ttm-icon_element-style-rounded"
                        >
                          <img src={upload} />
                        </div>
                      </div>
                      <div className="featured-title">
                        <h5> Easy upload for guests</h5>
                        <p>
                          No app required, they just scan the QR code or click
                          the link and start uploading their photos
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="featured-box text-center res-991-mt-20">
                    <div className="icon-outline-border">
                      <div className="featured-icon">
                        <div
                          style={feature}
                          className="ttm-icon ttm-icon_element-size-lg ttm-icon_element-fill ttm-icon_element-background-skincolor ttm-icon_element-style-rounded"
                        >
                          <img src={gallery} />
                        </div>
                      </div>
                      <div className="featured-title">
                        <h5>Live gallery</h5>
                        <p>
                          Live gallery which can be displayed at the event on
                          screen showing photos as they are uploaded
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="featured-box text-center res-991-mt-20">
                    <div className="icon-outline-border">
                      <div className="featured-icon">
                        <div
                          style={feature}
                          className="ttm-icon ttm-icon_element-size-lg ttm-icon_element-fill ttm-icon_element-background-skincolor ttm-icon_element-style-rounded"
                        >
                          <img src={slideshow} />
                        </div>
                      </div>
                      <div className="featured-title">
                        <h5>Slideshow</h5>
                        <p>
                          Activate the live photo slideshow feature and watch as
                          photos are automatically added for everyone to enjoy!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-3">
                  <div className="featured-box text-center res-991-mt-20">
                    <div className="icon-outline-border">
                      <div className="featured-icon">
                        <div
                          style={feature}
                          className="ttm-icon ttm-icon_element-size-lg ttm-icon_element-fill ttm-icon_element-background-skincolor ttm-icon_element-style-rounded"
                        >
                          <img src={guestbook} />
                        </div>
                      </div>
                      <div className="featured-title">
                        <h5>Digital Guestbook</h5>
                        <p>
                          Receive digital guestbook messages or testimonials
                          from guests in a CSV file. It's the perfect
                          accompaniment to your photo collection no matter what
                          type of event you're hosting.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="featured-box text-center res-991-mt-20">
                    <div className="icon-outline-border">
                      <div className="featured-icon">
                        <div
                          style={feature}
                          className="ttm-icon ttm-icon_element-size-lg ttm-icon_element-fill ttm-icon_element-background-skincolor ttm-icon_element-style-rounded"
                        >
                          <img src={storage} />
                        </div>
                      </div>
                      <div className="featured-title">
                        <h5> Unlimited storage</h5>
                        <p>
                          Get the full high resolution images from your event,
                          we don't resize or reduce the quality Unlimited
                          storage allowing you to collect all the high
                          resolution images from your event
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="featured-box text-center res-991-mt-20">
                    <div className="icon-outline-border">
                      <div className="featured-icon">
                        <div
                          style={feature}
                          className="ttm-icon ttm-icon_element-size-lg ttm-icon_element-fill ttm-icon_element-background-skincolor ttm-icon_element-style-rounded"
                        >
                          <img src={calendar} />
                        </div>
                      </div>
                      <div className="featured-title">
                        <h5>Access your photos for a year</h5>
                        <p>
                          We store your event photos for a year after your event
                          date and you can download them at any time
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="featured-box text-center res-991-mt-20">
                    <div className="icon-outline-border">
                      <div className="featured-icon">
                        <div
                          style={feature}
                          className="ttm-icon ttm-icon_element-size-lg ttm-icon_element-fill ttm-icon_element-background-skincolor ttm-icon_element-style-rounded"
                        >
                          <img src={download} />
                        </div>
                      </div>
                      <div className="featured-title">
                        <h5>Download all your photos</h5>
                        <p>
                          Your digital album is neatly zipped containing all
                          original resolution content. You can download your zip
                          any time. It's the perfect way to print and keep those
                          treasured memories forever.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* service-process-section2 END */}
        </div>
        {/* site-main end */}
      </>
      <style>{`
  /* Fade-in animation */
  .fade-in-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 1s ease-out, transform 1s ease-out;
  }

  .fade-in-visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Hover zoom for images */
  img:hover {
    transform: scale(1.03);
    transition: transform 0.6s ease;
  }

  /* Gentle float for boxes */
  .featured-box:hover,
  .ttm-fid:hover {
    transform: translateY(-8px);
    transition: transform 0.4s ease;
  }
`}</style>

      <Footer />
    </>
  );
};

export default About;
