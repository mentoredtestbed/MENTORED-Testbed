import { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
// import { useHistory } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// const AuthContext = createContext();
// let AuthContext = createContext();
const AuthContext = createContext('auth');
// const AuthContext = createContext({ signed: true });
// const AuthContext = createContext(null);
// const AuthContext = createContext({
//   user: null,
//   setUser: null,
//   authTokens: null,
//   setAuthTokens: null,
//   registerUser: null,
//   loginUser: null,
//   logoutUser: null
// });

import React, { Component } from 'react';

// const AuthContext = createContext<IAuth>(null);

const backend_addr = 'http://mentored-testbed.cafeexpresso.rnp.br'
export default AuthContext;

// export let contextData = {};


export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );
  const [user, setUser] = useState(() =>
    localStorage.getItem("authTokens")
      ? jwt_decode(localStorage.getItem("authTokens"))
      : null
  );
  const [loading, setLoading] = useState(true);

  const history = useNavigate();

  const loginUser = async (username, password) => {
    const response = await fetch(backend_addr + "/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    });
    const data = await response.json();

    if (response.status === 200) {
      setAuthTokens(data);
      setUser(jwt_decode(data.access));
      localStorage.setItem("authTokens", JSON.stringify(data));
      // history.push("/");
      history("/");
    } else {
      alert("Something went wrong!");
    }
  };
  
  const registerUser = async (username, password, password2) => {
    const response = await fetch(backend_addr + "/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password,
        password2
      })
    });
    if (response.status === 201) {
      // history.push("/login");
      history("/login");
    } else {
      alert("Something went wrong!");
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    history.push("/");
  };

  const contextData = {
    user,
    setUser,
    authTokens,
    setAuthTokens,
    registerUser,
    loginUser,
    logoutUser
  };

  // let contextData = 'blabla'

  useEffect(() => {
    if (authTokens) {
      setUser(jwt_decode(authTokens.access));
    }
    setLoading(false);
  }, [authTokens, loading]);

  
  return (
    <AuthContext.Provider value={ contextData } >
      {loading ? null : children}
    </AuthContext.Provider>
  );
};