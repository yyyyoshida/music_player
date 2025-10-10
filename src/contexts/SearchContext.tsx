import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { TrackObject } from "../store/playbackStore";
import usePlaybackStore from "../store/playbackStore";
import { useLocation } from "react-router-dom";

type SearchContextType = {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  searchResults: TrackObject[];
  setSearchResults: React.Dispatch<React.SetStateAction<TrackObject[]>>;
  hasSearchError: boolean;
  setHasSearchError: React.Dispatch<React.SetStateAction<boolean>>;
};

type SearchContextProviderProps = {
  children: ReactNode;
};

export const SearchContext = createContext<SearchContextType | null>(null);

export const SearchProvider = ({ children }: SearchContextProviderProps) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TrackObject[]>([]);
  const [hasSearchError, setHasSearchError] = useState(false);
  const setQueue = usePlaybackStore((state) => state.setQueue);
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
