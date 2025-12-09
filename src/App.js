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
import UseCases from "./site/pages/UseCases";
import HowItWorks from "./site/pages/HowItWorks";
import PricingPage from "./site/pages/PricingPage";
 
import HorizonWrapper from "./components/HorizonWrapper";
import HorizonDashboard from "./pages/HorizonDashboard";
import AdminLayout from "./layouts/admin";
import Guest_Gallery from "./pages/Guest_Gallery";

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
            <Route path="/admin">
              <HorizonWrapper>
                <HorizonDashboard />
              </HorizonWrapper>
            </Route>

            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/about">
              <About />
            </Route>
            <Route exact path="/usecases">
              <UseCases />
            </Route>
            <Route exact path="/howitworks">
              <HowItWorks />
            </Route>
            {/* <Route exact path="/pricing">
              <PricingPage />
            </Route> */}

            <Route exact path="/dashboard">
              {!user && <Redirect to="/login" />}
              {user && (
                <HorizonWrapper>
                  {/* <Sidebar role={UserInfo.role}> */}
                  <Dashboard />
                  {/* </Sidebar> */}
                </HorizonWrapper>
              )}
            </Route>

            <Route path="/CanvaTemplates/:type">
              {!user && <Redirect to="/login" />}
              {user && (
                <HorizonWrapper>
                  <Sidebar role={UserInfo.role}>
                    <CanvaTemplates />
                  </Sidebar>
                </HorizonWrapper>
              )}
            </Route>
            <Route path="/CanvaTemplates">
              {!user && <Redirect to="/login" />}
              {user && (
                <HorizonWrapper>
                  <Sidebar role={UserInfo.role}>
                    <CanvaTemplates />
                  </Sidebar>
                </HorizonWrapper>
              )}
            </Route>
            <Route path="/admin/create-event">
              {!user && <Redirect to="/login" />}
              {user && (
                <HorizonWrapper>
                  {/* <Sidebar role={UserInfo.role}> */}
                  <CreateEvent />
                  {/* </Sidebar> */}
                </HorizonWrapper>
              )}
            </Route>
            <Route path="/admin/edit-event/:id">
              {!user && <Redirect to="/login" />}
              {user && (
                <HorizonWrapper>
                  <UpdateEvent />
                </HorizonWrapper>
              )}
            </Route>
            <Route path="/admin/events/:id">
              {!user && <Redirect to="/login" />}
              {user && (
                <HorizonWrapper>
                  <Event />
                </HorizonWrapper>
              )}
            </Route>
            {/* Owner / paid gallery */}
            {/* <Route path="/admin/gallery/owner/:id">
              <HorizonWrapper>
                <Gallery />
              </HorizonWrapper>
            </Route> */}

            {/* Public guest gallery link */}
            <Route path="/admin/gallery/guest/:id">
              <HorizonWrapper>
                <Guest_Gallery />
              </HorizonWrapper>
            </Route>
            

            {/* <Route path="/admin/gallery/:userType/:id">
              {!user && <Redirect to="/login" />}
              {user && (
                <HorizonWrapper>
                  <Gallery />
                </HorizonWrapper>
              )}
            </Route> */}
            <Route path="/admin/videos/:userType/:id">
              {!user && <Redirect to="/login" />}
              {user && (
                <HorizonWrapper>
                  <Videos />
                </HorizonWrapper>
              )}
            </Route>
            <Route path="/admin/guestbook/:userType/:id">
              {!user && <Redirect to="/login" />}
              {user && (
                <HorizonWrapper>
                  <Guestbook />
                </HorizonWrapper>
              )}
            </Route>
            {/* <Route path="/gallery_guest/:id">
              {!user && <Redirect to="/login_Guest" />}
              {user && (
                <HorizonWrapper>
                  <Sidebar_Guest>
                    <Gallery />
                  </Sidebar_Guest>
                </HorizonWrapper>
              )}
            </Route> */}
            <Route path="/Guest/Dashboard/:id">
              {/* {!user && <Redirect to="/login_Guest" />}
              {user && ( */}
              <HorizonWrapper>
                <Sidebar_Guest role={UserInfo.role}>
                  <Guest_Dashboard />
                </Sidebar_Guest>
              </HorizonWrapper>
              {/* )}  */}
            </Route>
            {/* <Route path="/Guest/Gallery/:id">
              {/* {!user && <Redirect to="/login_Guest" />}
              {user && (  
            <HorizonWrapper>
              <Sidebar_Guest>
                <Gallery />
              </Sidebar_Guest>
            </HorizonWrapper>
            {/* )} 
            </Route> */}
            <Route path="/Guest/Videos/:id">
              {/* {!user && <Redirect to="/login_Guest" />}
              {user && ( */}
              <HorizonWrapper>
                <Sidebar_Guest>
                  <Videos />
                </Sidebar_Guest>
              </HorizonWrapper>
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
             
               <Pricing />
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
