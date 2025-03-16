import React from "react";
import whatwedo from "../images/col-bgimage-3.jpg";

import Header_revslider from "../components/header/Header_revslider";
import Footer from "../components/footer/Footer";

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
                          <h2 className="title">About GUESTCAM</h2>
                          <p className="mb-25">
                            <strong>
                              GUESTCAM is a private photo sharing platform where
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
                          <a href="#"> Wedding</a>
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
                          <a href="#">Private Party</a>
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
                          <a href="#">Corporate Party</a>
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
                          <a href="#"> Birthdays</a>
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
                          <a href="#">Holidays</a>
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
                          <a href="#">Celebrations</a>
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
            <div className="container">
              <div className="row">
                <div
                  className="col-md-12 col-lg-6 pt-40"
                  style={{ backgroundColor: "white" }}
                >
                  {/* <!-- col-bg-img-three --> */}
                  <div className="col-bg-img-three ttm-col-bgimage-yes ttm-bg ttm-left-span res-991-mt-0 mt_60">
                    <div
                      className="ttm-col-wrapper-bg-layer ttm-bg-layer"
                      style={{
                        backgroundImage: `url(${whatwedo})`,
                        backgroundSize: "contain !important",
                        backgroundPosition: "0 40px !important",
                        marginLeft: 0,
                      }}
                    ></div>
                    <div className="layer-content"></div>
                  </div>
                  {/* <!-- col-bg-img-three end --> */}
                </div>
                <div className="col-lg-6 col-md-12">
                  {/* <!-- about-content --> */}
                  <div
                    style={{ marginLeft: "0px" }}
                    className="about-content ttm-bg ttm-col-bgcolor-yes ttm-right-span ttm-bgcolor-skincolor padding-15"
                  >
                    <div className="ttm-col-wrapper-bg-layer ttm-bg-layer"></div>
                    <div className="layer-content">
                      {/* <!-- section title --> */}
                      <div
                        className="section-title with-desc clearfix"
                        style={{ color: "rgb(35, 35, 35)" }}
                      >
                        <div className="title-header">
                          <h2 style={{ color: "rgb(35, 35, 35)" }}>
                            WHAT WE DO
                          </h2>
                          {/* <!-- <h2 className="title">Get Premium Our Services</h2> --> */}
                        </div>
                        <p style={{ color: "rgb(35, 35, 35)" }}>
                          GUESTCAM is an online album where your guests can
                          easily share all their photos from your event.
                        </p>

                        <p style={{ color: "rgb(35, 35, 35)" }}>
                          {" "}
                          You setup the event, create a QR code and link to your
                          album from our site.Your guests then scan the QR code
                          or enter the link and they can easily upload all the
                          photos they've taken, no need for them to create an
                          account or download a specific app.
                        </p>

                        <p style={{ color: "rgb(35, 35, 35)" }}>
                          {" "}
                          After the event you can download the full high
                          resolution photos your guests uploaded. We don't
                          resize the images or reduce the quality at all, so
                          they should be print quality if taken on a modern
                          smartphone.
                        </p>
                      </div>
                      {/* <!-- section title end --> */}
                      <div className="separator clearfix">
                        <div className="sep-line mb-50"></div>
                      </div>
                    </div>
                  </div>
                  {/* <!-- about-content end--> */}
                </div>
              </div>
            </div>
          </section>
          {/* <!--service-section.style2 end--> */}

          {/* <!--gallery-section start--> */}
          <section className="ttm-row service-process-section clearfix bg-img8 ttm-bgcolor-black ttm-bg ttm-bgimage-yes">
            <div className="ttm-row-wrapper-bg-layer ttm-bg-layer"></div>
            <div className="container">
              <div className="row text-center">
                <div className="col-lg-12">
                  <div className=" section-title clearfix">
                    <h4>What else makes it awesome for your events?</h4>
                    <h2 className="title">Event Photo Sharing Made Simple.</h2>
                    <div className="title-img">
                      <img src="images/ds-2.png" alt="underline-img" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-3">
                  <div className="featured-box text-center res-991-mt-20">
                    <div className="icon-outline-border">
                      <div className="featured-icon">
                        <div className="ttm-icon ttm-icon_element-size-lg ttm-icon_element-fill ttm-icon_element-background-skincolor ttm-icon_element-style-rounded">
                          <img src="images/icons/app.png" />
                        </div>{" "}
                        /
                      </div>
                      <div className="featured-title ttm-textcolor-white">
                        <h5>No Apps Required </h5>
                        <p>
                          Neither you or your guests need to waste time on
                          downloads. Just enter the link or scan the QR and let
                          the magic happens
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="featured-box text-center res-991-mt-20">
                    <div className="icon-outline-border">
                      <div className="featured-icon">
                        <div className="ttm-icon ttm-icon_element-size-lg ttm-icon_element-fill ttm-icon_element-background-skincolor ttm-icon_element-style-rounded">
                          <img src="images/icons/file.png" />
                        </div>
                      </div>
                      <div className="featured-title ttm-textcolor-white">
                        <h5>No Guest Registration</h5>

                        <p>
                          {" "}
                          Your GUESTCAM QR code / URL is how they add their best
                          photos, videos and guestbook messages and you can
                          download everything in a click.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="featured-box text-center res-991-mt-20">
                    <div className="icon-outline-border">
                      <div className="featured-icon">
                        <div className="ttm-icon ttm-icon_element-size-lg ttm-icon_element-fill ttm-icon_element-background-skincolor ttm-icon_element-style-rounded">
                          <img src="images/icons/caption.png" />
                        </div>
                      </div>
                      <div className="featured-title ttm-textcolor-white">
                        <h5>Captions Support</h5>
                        <p>
                          Guests can add a caption to a photo/video to make
                          things even more fun, interactive and personalized.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="featured-box text-center res-991-mt-20">
                    <div className="icon-outline-border">
                      <div className="featured-icon">
                        <div className="ttm-icon ttm-icon_element-size-lg ttm-icon_element-fill ttm-icon_element-background-skincolor ttm-icon_element-style-rounded">
                          <img src="images/icons/security.png" />
                        </div>
                      </div>
                      <div className="featured-title ttm-textcolor-white">
                        <h5>Private & Secured</h5>
                        <p>
                          Your photos are privately yours. No one else can view
                          or access your photos besides the people you share it
                          with.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* <!--gallery-section end--> */}

          {/* <!--testimonial--> */}
          <section className="testimonial-section ttm-row bg-layer break-991-colum">
            <div className="container">
              <div className="row">
                {/* <!--Testimonials--> */}
                <div className="col-md-12 col-lg-7">
                  <div className="ttm-col-bgcolor-yes ttm-bg ttm-left-span ttm-bgcolor-skincolor padding-3 res-1199-pl-15">
                    <div className="ttm-col-wrapper-bg-layer ttm-bg-layer">
                      <div className="ttm-bg-layer-inner"></div>
                    </div>
                    <div className="layer-content">
                      <div className="carousel-outer pr-10">
                        <div className="section-title clearfix mb-30">
                          <h4>TESTIMONAL</h4>
                          <h2 className="title ttm-textcolor-white">
                            Clients feedback
                          </h2>
                        </div>
                        {/* <!-- wrap-testimonial --> */}
                        <div
                          className="testimonial-slide owl-carousel"
                          data-item="1"
                          data-nav="false"
                          data-dots="false"
                          data-auto="false"
                        >
                          {/* <!-- testimonials --> */}
                          <div className="testimonials">
                            <div className="testimonial-content mb-35">
                              <div className="testimonial-avatar">
                                <div className="testimonial-img">
                                  <img
                                    className="img-center"
                                    src="images/feedback1.jpg"
                                    alt="testimonial-img"
                                  />
                                </div>
                              </div>
                              <div className="testimonial-caption">
                                <h6>Linda Jone</h6>
                                <label>Newyork City</label>
                              </div>
                              <blockquote>
                                Sed ut perspiciatis unde omnis iste natus error
                                sit voluptatem accusantium doloret quasi
                                architecto beatae vitae dicta sunt explicabo.
                                Nemo enim ipsam voluptatem quia voluptas sit.
                              </blockquote>
                            </div>
                          </div>
                          {/* <!-- testimonials end -->
                                            <!-- testimonials --> */}
                          <div className="testimonials">
                            <div className="testimonial-content mb-35">
                              <div className="testimonial-avatar">
                                <div className="testimonial-img">
                                  <img
                                    className="img-center"
                                    src="images/feedback2.jpg"
                                    alt="testimonial-img"
                                  />
                                </div>
                              </div>
                              <div className="testimonial-caption">
                                <h6>Tonny Edward</h6>
                                <label>Newyork City</label>
                              </div>
                              <blockquote>
                                Sed ut perspiciatis unde omnis iste natus error
                                sit voluptatem accusantium doloret quasi
                                architecto beatae vitae dicta sunt explicabo.
                                Nemo enim ipsam voluptatem quia voluptas sit.
                              </blockquote>
                            </div>
                          </div>
                          {/* <!-- testimonials end -->
                                            <!-- testimonials --> */}
                          <div className="testimonials">
                            <div className="testimonial-content mb-35">
                              <div className="testimonial-avatar">
                                <div className="testimonial-img">
                                  <img
                                    className="img-center"
                                    src="images/feedback3.jpg"
                                    alt="testimonial-img"
                                  />
                                </div>
                              </div>
                              <div className="testimonial-caption">
                                <h6>Teena Venanda</h6>
                                <label>Newyork City</label>
                              </div>
                              <blockquote>
                                Sed ut perspiciatis unde omnis iste natus error
                                sit voluptatem accusantium doloret quasi
                                architecto beatae vitae dicta sunt explicabo.
                                Nemo enim ipsam voluptatem quia voluptas sit.
                              </blockquote>
                            </div>
                          </div>
                          {/* <!-- testimonials end --> */}
                        </div>
                        {/* <!-- wrap-testimonial end--> */}
                      </div>
                    </div>
                  </div>
                </div>
                {/* <!--left Column-end--> */}
                <div className="col-md-12 col-lg-5">
                  <div className="col-bg-img-four ttm-col-bgimage-yes ttm-bg ttm-right-span ml_165 mt-60 res-991-mt-0">
                    <div className="ttm-col-wrapper-bg-layer ttm-bg-layer"></div>
                    <div className="layer-content"></div>
                  </div>
                  <img
                    src="images/bg-image/col-bgimage-4.jpg"
                    className="ttm-equal-height-image"
                    alt="bg-image"
                  />
                </div>
                {/* <!--Testimonials-end--> */}
              </div>
            </div>
          </section>
          {/* <!--End testimonial--> */}
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
