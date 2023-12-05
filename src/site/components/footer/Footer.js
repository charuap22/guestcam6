import React from 'react'

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
                      Organising GUESTCAM for your event is a win-win for you
                      and your guests.
                    </p>

                    <a
                      className="ttm-btn ttm-btn-size-md ttm-btn-shape-round ttm-btn-style-border ttm-btn-color-white mt-20"
                      href="#"
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
                        <i className="fa fa-map-marker"></i>Themeforest, Envanto
                        HQ
                        <br />
                        24 Fifth st., Los Angeles, USA
                      </li>
                      <li>
                        <i className="fa fa-envelope-o"></i>
                        <a href="#">info@example.com</a>
                      </li>
                      <li>
                        <i className="fa fa-phone"></i>Phone: (+01) 123 456 7890{" "}
                        <br />
                        Support: (+01) 123 456 7890{" "}
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="widget-area col-xs-12 col-sm-6 col-md-6 col-lg-3">
                  <div className="widget widget_nav_menu clearfix">
                    <h4 className="widget-title">Quick Links </h4>
                    <ul className="menu-footer-services">
                      <li>
                        <a href="#">Pricing</a>
                      </li>
                      <li>
                        <a href="#">How It Works</a>
                      </li>
                      <li>
                        <a href="#">FAQ's</a>
                      </li>
                      <li>
                        <a href="#">Contact</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="widget-area col-xs-12 col-sm-6 col-md-6 col-lg-3">
                  <div className="widget widget_nav_menu clearfix">
                    <h4 className="widget-title">Our Services </h4>
                    <ul className="menu-footer-services">
                      <li>
                        <a href="#">Weddings</a>
                      </li>
                      <li>
                        <a href="#">Corporate </a>
                      </li>
                      <li>
                        <a href="#">Birthdays</a>
                      </li>
                      <li>
                        <a href="#">Celebrations</a>
                      </li>
                      <li>
                        <a href="#">Holidays</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="widget-area col-xs-12 col-sm-6 col-md-6 col-lg-3">
                  <div className="widget widget-out-link clearfix ">
                    <h4 className="widget-title">Frequent Questions</h4>
                    <ul className="widget-text">
                      <li>
                        <a href="#">Why should I use GUESTCAM on my Event? </a>
                      </li>
                      {/* <!-- <li><a href="#">What do I need to make Kululu work on my wedding? </a></li> --> */}
                      <li>
                        <a href="#">
                          Do I or my guests need to download an app?
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          Why is it better than Google Photos/Dropbox/other
                          apps?{" "}
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          Can I print the QR code for the wedding pictures?{" "}
                        </a>
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
                    <img
                      src="images/logo-img.png"
                      alt="company-logo"
                      height="45"
                    />
                  </div>
                  <div className="company-desc">
                    At vero eos et accusamus et iusto odio dignissimos ducimus
                    qui blanditiis praesue corrupti quos dolores et quas
                    molestias excepturi sint occaecati cupiditate non provident,
                    similique sunt in culp.
                  </div>
                </div>
              </div>
              <div className="col-sm-12 col-xs-12 col-md-4 ttm-footer2-right">
                <div className="ttm-social-link-wrapper">
                  <ul className="social-icons">
                    <li>
                      <a href="#" target="_blank">
                        <i className="fa fa-facebook"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#" target="_blank">
                        <i className="fa fa-twitter"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#" target="_blank">
                        <i className="fa fa-instagram"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#" target="_blank">
                        <i className="fa fa-youtube-play"></i>
                      </a>
                    </li>
                  </ul>
                </div>
                <p>Copyright © 2023 Guestcam. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* <!--footer-END--> */}
    </>
  );
}

export default Footer