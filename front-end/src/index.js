import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Redirect } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";
import 'react-toastify/dist/ReactToastify.css';


import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import AuthRoutes from "./components/PrivateRoute/AuthRoutes";
import { StatusProvider } from './views/examples/StatusContext';

ReactDOM.render(
  <StatusProvider>
  <BrowserRouter>
    <Switch>
      <PrivateRoute path="/admin" component={AdminLayout} />
      <AuthRoutes path="/auth" component={AuthLayout} />
      <Redirect from="/" to="/admin/index" />
    </Switch>
  </BrowserRouter>
  </StatusProvider>,
  document.getElementById("root")
);
