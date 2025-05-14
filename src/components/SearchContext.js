import React, { createContext, useState, useContext, useEffect } from "react";
import { PlaybackContext } from "../contexts/PlaybackContext";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // const [isTrackSet, setIsTrackSet] = useState(false);

  const { setQueue, queue } = useContext(PlaybackContext);

  useEffect(() => {
    setQueue(searchResults);
  }, [searchResults]);

  return (
    // <SearchContext.Provider value={{ query, setQuery, searchResults, setSearchResults, isTrackSet, setIsTrackSet }}>
    <SearchContext.Provider value={{ query, setQuery, searchResults, setSearchResults }}>{children}</SearchContext.Provider>
  );
};

export default SearchContext;
