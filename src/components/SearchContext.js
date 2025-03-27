import React, { createContext, useState, useContext } from 'react';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  return <SearchContext.Provider value={{ query, setQuery, searchResults, setSearchResults }}>{children}</SearchContext.Provider>;
};

export default SearchContext;
