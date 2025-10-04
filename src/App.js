import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";
// styles
import "./App.css";

// pages & components
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Gallery from "./pages/Gallery";
import Sidebar from "./components/Sidebar";

import CreateEvent from "./pages/CreateEvent";
import Pricing from "./pages/Pricing";
import Event from "./pages/Event";
import Guest_Login from "./pages/Guest_Login";
import Sidebar_Guest from "./components/Sidebar_Guest";
import Guest_Dashboard from "./pages/Guest_Dashboard";
import Videos from "./pages/Videos";
import Guestbook from "./pages/Guestbook";
import { useUserInfo } from "./hooks/useUserInfo";
import UpdateEvent from "./pages/EditEvent";
import UpdateEvent2 from "./pages/EditEvent";
import CanvaTemplates from "./pages/CanvaTemplates";
import SuccessPage from "./pages/SuccessPage";
import Home from "./site/pages/Home";
import About from "./site/pages/About";
import CancelPage from "./pages/CancelPage";

function App() {
  const { authIsReady, user } = useAuthContext();
  const { UserInfo } = useUserInfo();
  console.log("UserInfo", UserInfo);
  return (
    <>
      {authIsReady && (
        <BrowserRouter>
          {/* <Sidebar  /> */}
          <Switch>
            <Route exact path="/dashboard">
              {!user && <Redirect to="/login" />}

              {user && (
                <Sidebar role={UserInfo.role}>
                  <Dashboard />
                </Sidebar>
              )}
            </Route>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/about">
              <About />
            </Route>
            <Route path="/CanvaTemplates/:type">
              {!user && <Redirect to="/login" />}
              {user && (
                <Sidebar role={UserInfo.role}>
                  <CanvaTemplates />
                </Sidebar>
              )}
            </Route>
            <Route path="/CanvaTemplates">
              {!user && <Redirect to="/login" />}
              {user && (
                <Sidebar role={UserInfo.role}>
                  <CanvaTemplates />
                </Sidebar>
              )}
            </Route>
            <Route path="/create-event">
              {!user && <Redirect to="/login" />}
              {user && (
                <Sidebar role={UserInfo.role}>
                  <CreateEvent />
                </Sidebar>
              )}
            </Route>
            <Route path="/edit-event/:id">
              {!user && <Redirect to="/login" />}
              {user && (
                <Sidebar role={UserInfo.role}>
                  <UpdateEvent />
                </Sidebar>
              )}
            </Route>
            <Route path="/events/:id">
              {!user && <Redirect to="/login" />}
              {user && (
                <Sidebar role={UserInfo.role}>
                  <Event />
                </Sidebar>
              )}
            </Route>
            <Route path="/gallery/:userType/:id">
              {!user && <Redirect to="/login" />}
              {user && (
                <Sidebar role={UserInfo.role}>
                  <Gallery />
                </Sidebar>
              )}
            </Route>
            <Route path="/videos/:userType/:id">
              {!user && <Redirect to="/login" />}
              {user && (
                <Sidebar role={UserInfo.role}>
                  <Videos />
                </Sidebar>
              )}
            </Route>
            <Route path="/guestbook/:userType/:id">
              {!user && <Redirect to="/login" />}
              {user && (
                <Sidebar role={UserInfo.role}>
                  <Guestbook />
                </Sidebar>
              )}
            </Route>
            <Route path="/gallery_guest/:id">
              {!user && <Redirect to="/login_Guest" />}
              {user && (
                <Sidebar_Guest>
                  <Gallery />
                </Sidebar_Guest>
              )}
            </Route>
            <Route path="/Guest/Dashboard/:id">
              {/* {!user && <Redirect to="/login_Guest" />}
              {user && ( */}
              <Sidebar_Guest role={UserInfo.role}>
                <Guest_Dashboard />
              </Sidebar_Guest>
              {/* )}  */}
            </Route>
            <Route path="/Guest/Gallery/:id">
              {/* {!user && <Redirect to="/login_Guest" />}
              {user && ( */}
              <Sidebar_Guest>
                <Gallery />
              </Sidebar_Guest>
              {/* )}  */}
            </Route>
            <Route path="/Guest/Videos/:id">
              {/* {!user && <Redirect to="/login_Guest" />}
              {user && ( */}
              <Sidebar_Guest>
                <Videos />
              </Sidebar_Guest>
              {/* )}  */}
            </Route>
            <Route path="/login">
              {/* {user && <Redirect to="/" />} */}
              {/* {!user &&  */}
              <Login />
              {/* } */}
            </Route>
            <Route path="/Guest_Login/:id">
              <Guest_Login />
            </Route>
            <Route path="/signup">
              {/* {user && <Redirect to="/" />}

              {!user && <Signup />} */}
              <Signup />
            </Route>
            <Route path="/pricing">
              {!user && <Redirect to="/login" />}
              {user && <Pricing />}
            </Route>
            <Route path="/success">
              {!user && <Redirect to="/login" />}
              {user && <SuccessPage />}
            </Route>
            <Route path="/cancel">
              {!user && <Redirect to="/login" />}
              {user && <CancelPage />}
            </Route>
          </Switch>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
