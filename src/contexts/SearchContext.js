import { createContext, useState, useContext, useEffect } from "react";
import { PlaybackContext } from "../contexts/PlaybackContext";
import { useLocation } from "react-router-dom";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearchError, setHasSearchError] = useState(false);

  const { setQueue, queue } = useContext(PlaybackContext);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/search-result") return;

    setQueue(searchResults);
  }, [searchResults, location.pathname]);

  return (
    <SearchContext.Provider value={{ query, setQuery, searchResults, setSearchResults, hasSearchError, setHasSearchError }}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;
