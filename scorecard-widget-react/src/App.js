import { Fragment } from "react";
import { HashRouter, BrowserRouter as Router, Route } from "react-router-dom";
import Login from './components/login/Login';
import PrivateRoute from "./components/PrivateRoute";
import Calendar from "./components/calendar/Calendar";
import Scorecard from "./components/scorecard/Scorecard";
import Loader from "./components/Loader";
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.min.css";
import "react-perfect-scrollbar/dist/css/styles.min.css";
import "./App.css";

function App() {
  return (
    <Fragment>
      <ToastContainer
        position="bottom-right"
        theme="colored"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Loader />
      <HashRouter>
        <Route exact path="/" component={ Login } />
        <PrivateRoute exact path="/calendar" component={ Calendar } />
        <PrivateRoute exact path="/scorecard" component={ Scorecard } />
      </HashRouter>
    </Fragment>
  );
};

export default App;
