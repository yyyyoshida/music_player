import React, { useContext } from "react";
import SearchResultList from "./SearchResultList";
import { SearchContext } from "./SearchContext";
import TrackListHead from "./TrackListHead";

const SearchResult = ({ containerRef }) => {
  const { query } = useContext(SearchContext);
  return (
    <section className="search-result">
      <div className="search-result__header">
        <h2 className="search-result__title">{`${query}の検索結果`}</h2>

        <TrackListHead />
      </div>

      <SearchResultList containerRef={containerRef} />
    </section>
  );
};

export default SearchResult;
