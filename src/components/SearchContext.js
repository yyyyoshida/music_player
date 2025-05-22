import React, { createContext, useState, useContext, useEffect } from "react";
import { PlaybackContext } from "../contexts/PlaybackContext";
import { useLocation } from "react-router-dom";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const { setQueue, queue } = useContext(PlaybackContext);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/search-result") return;

    console.log("SearchContextのsetQueueが発火");

    setQueue(searchResults);
  }, [searchResults, location.pathname]);

  return <SearchContext.Provider value={{ query, setQuery, searchResults, setSearchResults }}>{children}</SearchContext.Provider>;
};

export default SearchContext;
