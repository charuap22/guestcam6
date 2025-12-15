import React from "react";
import { Text, Link } from "@chakra-ui/react";

const Footer = () => {
  return (
    <>
      {/* <!--footer-->  */}
      <footer className="footer widget-footer bg-img11 ttm-bgcolor-black ttm-bg ttm-bgimage-yes clearfix">
        <div className="ttm-row-wrapper-bg-layer ttm-bg-layer"></div>
        <div className="first-footer ttm-textcolor-white">
          <div className="container">
            <div className="row">
              <div className="widget-area col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <aside className="widget widget-text">
                  <div className="ttm-newstter-box  mt-60">
                    <h2>
                      Want to know{" "}
                      <span className="ttm-textcolor-skincolor">more?</span>
                    </h2>
                    <p>
                      Choosing GUESTPOV for your event is a win-win for you and
                      your guests.
                    </p>

                    <a
                      className="ttm-btn ttm-btn-size-md ttm-btn-shape-round ttm-btn-style-border ttm-btn-color-white mt-20"
                      href="/howitworks"
                    >
                      How It Works?
                    </a>
                  </div>
                </aside>
              </div>
            </div>
            {/* <!-- row end -->  */}
          </div>
        </div>
        <div className="second-footer">
          <div className="container">
            <div className="second-footer-inner">
              <div className="row">
                <div className="widget-area col-xs-12 col-sm-6 col-md-6 col-lg-3">
                  <div className="widget widget-out-link clearfix">
                    <h4 className="widget-title">Contact Us</h4>
                    <ul className="widget-contact">
                      <li>
                        <i className="fa fa-map-marker"></i>Langley, British
                        Columbia Canada
                      </li>
                      <li>
                        <i className="fa fa-envelope-o"></i>
                        <Link href="mailto:info@guestpov.ca?subject=GuestPOV%20Inquiry">
                          info@guestpov.ca
                        </Link>
                      </li>
                      {/* <li>
                        <i className="fa fa-phone"></i>Phone: 1-778-998-5506{" "}
                        <br />
                      </li> */}
                    </ul>
                  </div>
                </div>
                <div className="widget-area col-xs-12 col-sm-6 col-md-6 col-lg-3">
                  <div className="widget widget_nav_menu clearfix">
                    <h4 className="widget-title">Quick Links </h4>
                    <ul className="menu-footer-services">
                      <li>
                        <a href="/pricing">Pricing</a>
                      </li>
                      <li>
                        <a href="/howitworks">How It Works</a>
                      </li>
                      <li>
                        <a href="/about">About Us</a>
                      </li>
                      <li>
                        <a href="/contact">Contact</a>
                      </li>
                      <li>
                        <a href="/usecases">Events</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="widget-area col-xs-12 col-sm-6 col-md-6 col-lg-3">
                  <div className="widget widget_nav_menu clearfix">
                    <h4 className="widget-title">Our Services </h4>
                    <ul className="menu-footer-services">
                      <li>
                        <a href="/usecases">Weddings</a>
                      </li>
                      <li>
                        <a href="/usecases">Corporate </a>
                      </li>
                      <li>
                        <a href="/usecases">Birthdays</a>
                      </li>
                      <li>
                        <a href="/usecases">Celebrations</a>
                      </li>
                      <li>
                        <a href="/usecases">Holidays</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="widget-area col-xs-12 col-sm-6 col-md-6 col-lg-3">
                  <div className="widget widget-out-link clearfix ">
                    <h4 className="widget-title">GuestPov</h4>
                    <ul className="widget-text">
                      <li>
                        <a href="#">Privacy Policy </a>
                      </li>
                      {/* <!-- <li><a href="#">What do I need to make Kululu work on my wedding? </a></li> --> */}
                      <li>
                        <a href="#">Terms of Use</a>
                      </li>
                      <li>
                        <a href="#">Affiliates and Partners</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom-footer-text">
          <div className="container">
            <div className="row">
              <div className="col-md-8 col-sm-12 col-xs-12 ttm-footer2-left">
                <div className="company-info">
                  <div className="company-logo">
                    <img src="images/GuestPOV.svg" alt="company-logo" />
                  </div>
                  <div className="company-desc">
                    <Text color="gray.600" mt={4}>
                      We are proudly Canadian-owned and operating out of British
                      Columbia, serving our communities with a platform built
                      close to home—because every event is unique, and every
                      moment deserves to be remembered.
                    </Text>
                  </div>
                </div>
              </div>
              <div className="col-sm-12 col-xs-12 col-md-4 ttm-footer2-right">
                <div className="ttm-social-link-wrapper">
                  <ul className="social-icons">
                    <li>
                      <a
                        href="https://www.facebook.com/profile.php?id=61581981119620"
                        target="_blank"
                      >
                        <i className="fa fa-facebook"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.instagram.com/guestpov_official/"
                        target="_blank"
                      >
                        <i className="fa fa-twitter"></i>
                      </a>
                    </li>
                  
                  </ul>
                </div>
                <p>Copyright © 2025 Guestpov. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* <!--footer-END--> */}
    </>
  );
};

export default Footer;
