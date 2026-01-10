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

import AdminLayout from "./layouts/admin";
import Guest_Gallery from "./pages/Guest_Gallery";
import { Suspense } from "react";
import RouteGuard from "./routes/RouteGuard";
 


function App() {
  const { authIsReady, user } = useAuthContext();
  const { UserInfo } = useUserInfo();
  console.log("UserInfo", UserInfo);
  return (
    <>
      {authIsReady && (
        <BrowserRouter>
          <Suspense
            fallback={
              <div
                style={{
                  minHeight: "100vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Loading...
              </div>
            }
          >
            <Switch>
              <Route path="/admin">
                <AdminLayout />
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
              <Route path="/admin">
                <RouteGuard access="owner">
                  <AdminLayout />
                </RouteGuard>
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
          </Suspense>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
