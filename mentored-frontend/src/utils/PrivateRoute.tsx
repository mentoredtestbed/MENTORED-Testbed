// import { Route, Redirect } from "react-router-dom";
import { Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

const PrivateRoute = ({ children, ...rest }) => {
  let { user } = useContext(AuthContext);
  // return <Route {...rest}>{!user ? <Navigate to="/login" /> : children}</Route>;
  return <Route path='/protected'> {!user ? <Navigate to="/login" /> : children}</Route>;
};

export default PrivateRoute;