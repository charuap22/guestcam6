import React, { useState } from "react";
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
const feature = {
  backgroundColor: "#e6c25000",
};
const About = () => {
  const [tabsToggle, setTabsToggle] = useState(1);
  function updateTabsToggleId(id) {
    setTabsToggle(id);
  }

  return (
    <>
      <>
        <Header
          title="ABOUT US"
          subtitle="I Do What I Love"
          headerImage={bannerBg}
        ></Header>

        <div className="site-main">
          {/* about-intro-section */}
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

          {/* about-intro-section END */}
          {/*service-section.style2 start*/}
          <section className="ttm-row service-section style2 bg-layer bg-layer-equal-height break-991-colum clearfix">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-lg-5">
                  {/* col-bg-img-three */}
                  <div className="col-bg-img-three ttm-col-bgimage-yes ttm-bg ttm-left-span res-991-mt-0 mt_60">
                    <div className="ttm-col-wrapper-bg-layer ttm-bg-layer" />
                    <div className="layer-content"></div>
                  </div>
                  {/* col-bg-img-three end*/}
                  <img
                    src="images/bg-image/col-bgimage-3.jpg"
                    className="ttm-equal-height-image"
                    alt="bg-image"
                  />
                </div>
                <div className="col-lg-7 col-md-12">
                  {/* about-content */}
                  <div className="about-content ttm-bg ttm-col-bgcolor-yes ttm-right-span ttm-bgcolor-skincolor padding-15">
                    <div className="ttm-col-wrapper-bg-layer ttm-bg-layer" />
                    <div className="layer-content">
                      {/* section title */}
                      <div className="section-title with-desc clearfix">
                        <div className="title-header">
                          <h4>WHAT WE DO</h4>
                          <h2 className="title">
                            Bring Your Guestbook to Life{" "}
                          </h2>
                        </div>
                        <p>
                          Guestcam transforms the guest book experience for the
                          joy and convenience of the planners, hosts and guests.
                          PixBash captures all the candid photos that guests
                          take with their devices. Wether you're planning a
                          wedding, a fundraiser, a graduation, social mixer,
                          birthday party or any other gathering, create the
                          priceless keepsake that captures the people that
                          matter.
                        </p>
                      </div>
                      {/* section title end */}
                      <div className="separator clearfix">
                        <div className="sep-line mb-50" />
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="featured-box style2 left-icon icon-align-top">
                            <div className="featured-icon">
                              <div className="ttm-icon ttm-icon_element-size-sm ttm-icon_element-color-white">
                                <img src={qrcode} />
                              </div>
                            </div>
                            <div className="featured-content">
                              <div className="featured-title">
                                <h5>Catering &amp; Decor</h5>
                              </div>
                              <div className="featured-desc">
                                <p>
                                  Lorem Ipsum is simply dummy text of the
                                  printing and typendard nknown printet.
                                </p>
                              </div>
                              <a
                                className="ttm-btn btn-inline ttm-btn-color-white ttm-icon-btn-right mt-5"
                                href="#"
                              >
                                View More
                                <i className="ti ti-angle-double-right" />
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="featured-box style2 left-icon icon-align-top">
                            <div className="featured-icon">
                              <div className="ttm-icon ttm-icon_element-size-sm ttm-icon_element-color-white">
                                <i className="flaticon flaticon-wedding-location" />
                              </div>
                            </div>
                            <div className="featured-content">
                              <div className="featured-title">
                                <h5>Venue Selections</h5>
                              </div>
                              <div className="featured-desc">
                                <p>
                                  Lorem Ipsum is simply dummy text of the
                                  printing and typendard nknown printet.
                                </p>
                              </div>
                              <a
                                className="ttm-btn btn-inline ttm-btn-color-white ttm-icon-btn-right mt-5"
                                href="#"
                              >
                                View More
                                <i className="ti ti-angle-double-right" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* about-content end*/}
                </div>
              </div>
            </div>
          </section>
          {/*service-section.style2 end*/}
          {/*timer-section start*/}
          <div className="ttm-row timer-section ttm-bgcolor-grey mt_60 clearfix">
            <div className="container">
              <div className="row align-item-center">
                <div className="col-md-12 col-lg-5">
                  <div className="section-title with-desc clearfix m-0">
                    <div className="title-header">
                      <h2 className="title mb-0 res-991-mb-30">
                        Our Upcoming Events:
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-12 col-lg-7 timer-wraper">
                  <div className="timer-box-content">
                    <div id="timer-box" className="timer-box">
                      <div className="line-bgimg2 timer-box-position">
                        <span className="days" />
                        <div className="bottom-txt">Days</div>
                      </div>
                      <div className="line-bgimg2 timer-box-position">
                        <span className="hours" />
                        <div className="bottom-txt">Hours</div>
                      </div>
                      <div className="line-bgimg2 timer-box-position">
                        <span className="minutes" />
                        <div className="bottom-txt">Minutes</div>
                      </div>
                      <div className="line-bgimg2  timer-box-position">
                        <span className="seconds" />
                        <div className="bottom-txt">Seconds</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/*timer-section end*/}
          {/* fid-section */}
          <section className="ttm-row fid-section ttm-bgcolor-black clearfix">
            <div className="container">
              <div className="row">
                <div className="col-md-6 col-sm-6 col-lg-3 counter-wrap">
                  {/*ttm-fid-content*/}
                  <div className="ttm-fid text-center">
                    <div className="ttm-fid-icon-wrapper ttm-icon ttm-icon_element-color-white ttm-icon_element-size-md">
                      <i className="ti ti-light-bulb" />
                    </div>
                    <div className="ttm-fid-contents">
                      <h4>
                        <span
                          data-appear-animation="animateDigits"
                          data-from={0}
                          data-to={878}
                          data-interval={10}
                          data-before=""
                          data-before-style="sup"
                          data-after=""
                          data-after-style="sub"
                        >
                          878
                        </span>
                      </h4>
                      <h3 className="ttm-fid-title">
                        <span>
                          GOOD COMMENTS
                          <br />
                        </span>
                      </h3>
                    </div>
                    {/* ttm-fld-contents end */}
                  </div>
                </div>
                <div className="col-md-6 col-sm-6 col-lg-3 counter-wrap">
                  <div className="ttm-fid text-center">
                    <div className="ttm-fid-icon-wrapper ttm-icon ttm-icon_element-color-white ttm-icon_element-size-md">
                      <i className="ti ti-image" />
                    </div>
                    <div className="ttm-fid-contents">
                      <h4>
                        <span
                          data-appear-animation="animateDigits"
                          data-from={0}
                          data-to={175}
                          data-interval={5}
                          data-before=""
                          data-before-style="sup"
                          data-after=""
                          data-after-style="sub"
                        >
                          175
                        </span>
                      </h4>
                      <h3 className="ttm-fid-title">
                        <span>
                          FEACTURED EVENTS
                          <br />
                        </span>
                      </h3>
                    </div>
                    {/* ttm-fld-contents end */}
                  </div>
                </div>
                <div className="col-md-6 col-sm-6 col-lg-3 counter-wrap">
                  {/*ttm-fid-content*/}
                  <div className="ttm-fid text-center">
                    <div className="ttm-fid-icon-wrapper ttm-icon ttm-icon_element-color-white ttm-icon_element-size-md">
                      <i className="ti ti-crown" />
                    </div>
                    <div className="ttm-fid-contents">
                      <h4>
                        <span
                          data-appear-animation="animateDigits"
                          data-from={0}
                          data-to={878}
                          data-interval={10}
                          data-before=""
                          data-before-style="sup"
                          data-after=""
                          data-after-style="sub"
                        >
                          878
                        </span>
                      </h4>
                      <h3 className="ttm-fid-title">
                        <span>
                          AWARD WINNING
                          <br />
                        </span>
                      </h3>
                    </div>
                    {/* ttm-fld-contents end*/}
                  </div>
                </div>
                <div className="col-md-6 col-sm-6 col-lg-3 counter-wrap">
                  {/*ttm-fid-content*/}
                  <div className="ttm-fid text-center">
                    <div className="ttm-fid-icon-wrapper ttm-icon ttm-icon_element-color-white ttm-icon_element-size-md">
                      <i className="ti ti-face-smile" />
                    </div>
                    <div className="ttm-fid-contents">
                      <h4>
                        <span
                          data-appear-animation="animateDigits"
                          data-from={0}
                          data-to={125}
                          data-interval={10}
                          data-before=""
                          data-before-style="sup"
                          data-after=""
                          data-after-style="sub"
                        >
                          125
                        </span>
                      </h4>
                      <h3 className="ttm-fid-title">
                        <span>
                          HAPPY CLIENT
                          <br />
                        </span>
                      </h3>
                    </div>
                    {/* ttm-fld-contents end*/}
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* fid-section end */}
          {/* team-section */}
          <section className="ttm-row about-team-section clearfix">
            <div className="container">
              <div className="row text-center">
                <div className="col-lg-12">
                  <div className=" section-title clearfix">
                    <h4>FUN WAYS TO USE</h4>
                    <h2 className="title">GUESTCAM at your event</h2>
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
                        upload all the antics to your GUESTCAM gallery.
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
                        Incorporating a guest challenge gets everyone involved.
                        Why not try an eye-spy game with a checklist of things
                        to photograph? Guests can upload a photo, video or
                        guestbook note as proof of their victory. Reward the
                        best submission with a prize!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* team-section END */}
          {/* service-process-section2 */}
          <section className="ttm-row ttm-bgcolor-white service-process-section2 clearfix">
            <div className="container">
              <div className="row text-center">
                <div className="col-lg-12">
                  <div className=" section-title clearfix">
                    <h4>OUR BEST FEATURES</h4>
                    <h2 className="title">With GUESTCAM you can</h2>
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
          {/* how it works */}
          <section className="ttm-row ttm-bgcolor-white service-process-section2 clearfix">
            <div className="container">
              <div className="row text-center">
                <div className="col-lg-12">
                  <div className=" section-title clearfix">
                    <h4>OUR BEST FEATURES</h4>
                    <h2 className="title">how it works</h2>
                    <div className="title-img">
                      <img src="images/ds-1.png" alt="underline-img" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12 col-md-12">
                  <div className="ttm-tabs element-tab-style-horizontal shape-rounded clearfix">
                    {/* <!-- tabs --> */}
                    <ul className="tabs clearfix">
                      <li
                        onClick={() => updateTabsToggleId(1)}
                        className={tabsToggle === 1 ? "tab active" : "tab"}
                      >
                        <a>
                          <i className="fa fa-cog"></i>STEP 1. Create Your Event
                        </a>
                      </li>
                      <li
                        onClick={() => updateTabsToggleId(2)}
                        className={tabsToggle === 2 ? "tab active" : "tab"}
                      >
                        <a>
                          <i className="fa fa-binoculars"></i>STEP 2. Display
                          Your QR Code & Share Your URL
                        </a>
                      </li>
                      <li
                        onClick={() => updateTabsToggleId(3)}
                        className={tabsToggle === 3 ? "tab active" : "tab"}
                      >
                        <a>
                          <i className="fa fa-tasks"></i> STEP 3. Instantly
                          Enjoy The Best Memories From Your Event
                        </a>
                      </li>
                    </ul>
                    <div className="content-tab">
                      <div
                        className={
                          tabsToggle === 1
                            ? "content-inner active"
                            : "content-inner"
                        }
                      >
                        <div className="row">
                          <div className="col-sm-6">
                            <img
                              className="img-fluid"
                              src={createEvent}
                              alt="image"
                            />
                          </div>
                          <div className="col-sm-6">
                            <p>
                              STEP 1 Create Your Event After purchase, add your
                              event date, event title, and a short welcome
                              message for your guests. This will be your welcome
                              page for guests once they scan your QR code or
                              click your URL. Only takes 2 mins to create!
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={
                          tabsToggle === 2
                            ? "content-inner active"
                            : "content-inner"
                        }
                      >
                        <div className="row">
                          <div className="col-sm-4">
                            <img
                              className="img-fluid"
                              src="images/blog/04.jpg"
                              alt="image"
                            />
                          </div>
                          <div className="col-sm-8">
                            <p>
                              STEP 2 Display Your QR Code & Share Your URL
                              Display your QR code at your event. You can even
                              copy and send your URL to guests digitally, or add
                              it to your event website and invitations. As a
                              bonus, you'll receive links to over 30 editable
                              Canva templates you can personalize and print
                              locally. Templates include a welcome sign, table
                              cards, mini take home cards & photo booth card. Or
                              send your GUESTPIX QR code to your stationer and
                              they'll do the rest!
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={
                          tabsToggle === 3
                            ? "content-inner active"
                            : "content-inner"
                        }
                      >
                        <div className="row">
                          <div className="col-sm-4">
                            <img
                              className="img-fluid"
                              src="images/blog/04.jpg"
                              alt="image"
                            />
                          </div>
                          <div className="col-sm-8">
                            <p>
                              STEP 3 Instantly Enjoy The Best Memories From Your
                              Event You and your guests will love seeing the
                              best moments roll into your digital gallery as you
                              impatiently wait for the professional ones to
                              arrive! It will be filled with unforgettable
                              photos, funny videos and heart-warming guestbook
                              messages. You can even stream photos at your event
                              by activating the slideshow feature! Everyone will
                              keep checking the gallery as it fills up with the
                              best moments from your event. Don't miss it!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* how it works END */}
        </div>
        {/* site-main end */}
      </>
    </>
  );
};

export default About;
