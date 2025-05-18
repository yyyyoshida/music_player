import React, { createContext, useState, useContext } from "react";

export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  // const [isLoading, setIsLoading] = useState(true);

  // const startLoading = () => setIsLoading(true);
  // const stopLoading = () => setIsLoading(false);
  const [isSearchLoading, setIsSearchLoading] = useState(true);

  const [isHomeLoading, setIsHomeLoading] = useState(true);

  const [isPlaylistsLoading, setIsPlaylistsLoading] = useState(true);

  const [isPlaylistSelectionLoading, setIsPlaylistSelectionLoading] = useState(true);

  return (
    <LoadingContext.Provider
      value={{
        isSearchLoading,
        setIsSearchLoading,
        isHomeLoading,
        setIsHomeLoading,
        isPlaylistsLoading,
        setIsPlaylistsLoading,

        isPlaylistSelectionLoading,
        setIsPlaylistSelectionLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;
