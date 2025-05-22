import React, { createContext, useState, useContext } from "react";

export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isHomeLoading, setIsHomeLoading] = useState(true);

  return (
    <LoadingContext.Provider
      value={{
        isHomeLoading,
        setIsHomeLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;
