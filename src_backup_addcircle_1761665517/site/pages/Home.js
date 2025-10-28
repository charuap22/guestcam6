import React from "react";
import whatwedo from "../images/col-bgimage-3.jpg";

import Header_revslider from "../components/header/Header_revslider";
import Footer from "../components/footer/Footer";
import WhatWeDo from '../components/whatwedo_section';
const Home = () => {
  return (
    <div style={{ overflowX: "hidden" }}>
      {/* <!--page start--> */}
      <div className="page">
        {/* <!-- preloader start --> */}
        <div id="preloader">
          <div id="status">&nbsp;</div>
        </div>
        {/* <!-- preloader end --> */}
        <Header_revslider></Header_revslider>

        {/* <!--site-main start--> */}
        <div className="site-main">
          {/* <!--intro-section start--> */}
          <section className="ttm-row welcome-section clearfix ttm-bgcolor-white">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-lg-6">
                  <div className="ttm_single_image_wrapper mt_20 res-991-mt-0">
                    <img
                      src="images/about-2.png"
                      alt="image"
                      className="img-fluid"
                    />
                  </div>
                </div>
                <div className="col-md-12 col-lg-6">
                  <div className="row">
                    <div className="col-md-12 col-lg-12">
                      <div className="pt-40 res-991-pt-30">
                        <div className="section-title">
                          <h2 className="title">About GuestPOV</h2>
                          <p className="mb-25">
                            <strong>
                              GuestPOV is a private photo sharing platform where
                              your guests can easily share all their photos from
                              your event.
                            </strong>
                          </p>
                        </div>
                        <div className="mt_19 mb-30 pr-35">
                          <p>
                            {" "}
                            You setup the event, create a QR code and link to
                            your album from our site. .
                          </p>
                        </div>
                        <div className="mt_19 mb-30 pr-35">
                          <p>
                            {" "}
                            Your guests then scan the QR code or enter the link
                            and they can easily upload all the photos they've
                            taken, no need for them to create an account or
                            download a specific app.
                          </p>
                        </div>
                        <div className="separator">
                          <div className="sep-line mt_5 mb-20 res-991-mb-0"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 col-sm-6">
                      {/* <!-- ttm-fid --> */}
                      <div className="ttm-fid inside ttm-fid-view-topicon">
                        <div className="ttm-fid-contents">
                          <h4>No App.</h4>
                        </div>
                        {/* <!-- ttm-fid-contents end --> */}
                      </div>
                      {/* <!-- ttm-fid end --> */}
                    </div>
                    <div className="col-md-6 col-sm-6">
                      {/* <!-- ttm-fid --> */}
                      <div className="ttm-fid inside ttm-fid-view-topicon">
                        <div className="ttm-fid-contents">
                          <h4>No Fuss.</h4>
                        </div>
                        {/* <!-- ttm-fid-contents end --> */}
                      </div>
                      {/* <!-- ttm-fid end --> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* <!--intro-section end--> */}

          {/* <!--service-section start--> */}
          <section className="ttm-row bg-img1 ttm-bgcolor-black service-section ttm-bg ttm-bgimage-yes clearfix">
            <div className="ttm-row-wrapper-bg-layer ttm-bg-layer"></div>
            <div className="container">
              <div className="row text-center">
                <div className="col-lg-12">
                  <div className=" section-title clearfix">
                    <h4>Event Photo Sharing Made Simple.</h4>
                    <h2 className="title">
                      {" "}
                      Instantly get every photo and video your guest take
                    </h2>
                    <div className="title-img">
                      <img src="images/ds-2.png" alt="underline-img" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 col-lg-4">
                  <div className="featured-imagebox static-title mb-20">
                    <div className="featured-thumbnail">
                      <img
                        className="img-fluid"
                        src="images/events_wedding.jpg"
                        alt=""
                      />
                    </div>
                    <div className="featured-content">
                      <div className="featured-title">
                        <h5>
                          <a href="/usecases"> Wedding</a>
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="featured-imagebox static-title mb-20">
                    <div className="featured-thumbnail">
                      <img
                        className="img-fluid"
                        src="images/events_privateparty.jpg"
                        alt=""
                      />
                    </div>
                    <div className="featured-content">
                      <div className="featured-title">
                        <h5>
                          <a href="/usecases">Private Party</a>
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="featured-imagebox static-title mb-20">
                    <div className="featured-thumbnail">
                      <img
                        className="img-fluid"
                        src="images/events_corpparty.jpg"
                        alt=""
                      />
                    </div>
                    <div className="featured-content">
                      <div className="featured-title">
                        <h5>
                          <a href="/usecases">Corporate Party</a>
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 col-lg-4">
                  <div className="featured-imagebox static-title mb-20">
                    <div className="featured-thumbnail">
                      <img
                        className="img-fluid"
                        src="images/events_birthday.jpg"
                        alt=""
                      />
                    </div>
                    <div className="featured-content">
                      <div className="featured-title">
                        <h5>
                          <a href="/usecases"> Birthdays</a>
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="featured-imagebox static-title mb-20">
                    <div className="featured-thumbnail">
                      <img
                        className="img-fluid"
                        src="images/events_vacations.jpg"
                        alt=""
                      />
                    </div>
                    <div className="featured-content">
                      <div className="featured-title">
                        <h5>
                          <a href="/usecases">Holidays</a>
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="featured-imagebox static-title mb-20">
                    <div className="featured-thumbnail">
                      <img
                        className="img-fluid"
                        src="images/events_celebrations.jpg"
                        alt=""
                      />
                    </div>
                    <div className="featured-content">
                      <div className="featured-title">
                        <h5>
                          <a href="/usecases">Celebrations</a>
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* <!--service-section end--> */}

          {/* <!--service-section.style2 start--> */}
          <section
            style={{ backgroundColor: "white" }}
            className="ttm-row service-section style2 bg-layer clearfix bg-layer-equal-height break-991-colum"
          >
            <WhatWeDo />
          </section>
          {/* <!--service-section.style2 end--> */}
        </div>
        {/* <!-- site-main end --> */}

        <Footer></Footer>
      </div>
      {/* <!-- page end --> */}
      {/* <!--back-to-top start--> */}
      <a id="totop" href="#top">
        <i className="fa fa-angle-up"></i>
      </a>
      {/* <!--back-to-top end--> */}
      {/* <!--page wrapper end--> */}
    </div>
  );
};

export default Home;
