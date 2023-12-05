import React from 'react'

const Menu = () => {
  return (
    <>
      {/* <!-- ttm-header-wrap --> */}
      <div className="ttm-header-wrap">
        {/* <!-- ttm-stickable-header-w --> */}
        <div
          id="ttm-stickable-header-w"
          className="ttm-stickable-header-w clearfix"
        >
          <div id="site-header-menu" className="site-header-menu">
            <div className="site-header-menu-inner ttm-stickable-header">
              <div className="container">
                {/* <!-- site-branding --> */}
                <div className="site-branding">
                  <a
                    className="home-link"
                    href="index.html"
                    title="GUESTCAM"
                    rel="home"
                  >
                    <img
                      id="logo-img"
                      className="img-center"
                      src="images/logo-img.png"
                      alt="logo-img"
                    />
                  </a>
                </div>
                {/* <!-- site-branding end --> */}

                {/* <!--site-navigation --> */}
                <div id="site-navigation" className="site-navigation">
                  <div className="ttm-menu-toggle">
                    <input type="checkbox" id="menu-toggle-form" />
                    <label
                      htmlFor="menu-toggle-form"
                      className="ttm-menu-toggle-block"
                    >
                      <span className="toggle-block toggle-blocks-1"></span>
                      <span className="toggle-block toggle-blocks-2"></span>
                      <span className="toggle-block toggle-blocks-3"></span>
                    </label>
                  </div>
                  <nav id="menu" className="menu">
                    <ul className="dropdown">
                      <li className="active">
                        <a href="index.html">Home</a>
                      </li>
                      <li>
                        <a href="index.html">About Us</a>
                      </li>
                      <li>
                        <a href="#">Use Cases</a>
                        <ul>
                          <li>
                            <a href="#">Wedding</a>
                          </li>
                          <li>
                            <a href="#">Private Party</a>
                          </li>
                          <li>
                            <a href="#">Corporate Party</a>
                          </li>
                          <li>
                            <a href="#">Birthdays</a>
                          </li>
                          <li>
                            <a href="#">Holidays</a>
                          </li>
                          <li>
                            <a href="#">Celebrations</a>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a href="#">How it works?</a>
                      </li>
                      <li>
                        <a href="#">Pricing</a>
                      </li>
                    </ul>
                  </nav>
                </div>
                {/* <!-- site-navigation end--> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <!--ttm-header-wrap end --> */}
    </>
  );
}

export default Menu