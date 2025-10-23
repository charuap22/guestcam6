import React from "react";
import { useHistory, NavLink,Link } from "react-router-dom";
import { AvatarInfo_Mobile } from "../../components/AvatarInfo_Mobile";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useLogout } from "../../hooks/useLogout";
import { Text } from "@chakra-ui/react";
import { useUserInfo } from "../../hooks/useUserInfo";
import { AvatarInfo } from "../../components/AvatarInfo";
const Menu = () => {
  const { authIsReady, user } = useAuthContext();
  const { logout, isPending } = useLogout();
  const { UserInfo } = useUserInfo();
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
                  <Link to="/">
                    <img
                      id="logo-img"
                      className="img-center"
                      src="images/GuestPOV.svg"
                      alt="logo-img"
                    />
                  </Link>
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
                        <NavLink exact to="/" activeClassName="active">
                          Home
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/about">About Us</NavLink>
                      </li>
                      <li>
                        <NavLink to="/usecases">Use Cases</NavLink>
                        <ul>
                          <li>
                            <a href="/usecases#wedding">Wedding</a>
                          </li>
                          <li>
                            <a href="/usecases#privateparty">Private Party</a>
                          </li>
                          <li>
                            <a href="/usecases#Corporate">Corporate Party</a>
                          </li>
                          <li>
                            <a href="/usecases#wedding">Birthdays</a>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <NavLink to="/howitworks">How it works?</NavLink>
                      </li>
                      <li>
                        <NavLink to="/pricing">Pricing</NavLink>
                      </li>

                      {/* <li>
                        {!isPending && user && UserInfo.role === "Admin" && (
                          <>
                            <NavLink to="/dashboard">Dashboard</NavLink>
                          </>
                        )}
                      </li>
                      <li>
                        {!isPending && user && UserInfo.role === "Admin" && (
                          <>{user.displayName + ","}</>
                        )}
                      </li>
                      <li>
                        {!isPending && user && UserInfo.role === "Admin" && (
                          <>
                            <NavLink to="#" onClick={logout}>
                              Logout
                            </NavLink>
                          </>
                        )}
                        {!user && <NavLink to="/login">Login</NavLink>}
                      </li> */}
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
};

export default Menu;
