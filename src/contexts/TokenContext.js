import React, { createContext, useState } from "react";

export const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
  // const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [token, setToken] = useState(null);
  const [isToken, setIsToken] = useState(false);

  return <TokenContext.Provider value={{ token, setToken, isToken, setIsToken }}>{children}</TokenContext.Provider>;
};

export default TokenContext;
