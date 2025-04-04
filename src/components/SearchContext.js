import React, { createContext, useState, useContext } from 'react';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState('');
  const [isToken, setIsToken] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isTrackSet, setIsTrackSet] = useState(false);

  return (
    <SearchContext.Provider value={{ query, setQuery, searchResults, setSearchResults, isToken, setIsToken, isTrackSet, setIsTrackSet }}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;
