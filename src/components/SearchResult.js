import { useContext } from "react";
import SearchResultList from "./SearchResultList";
import { SearchContext } from "../contexts/SearchContext";
import TrackListHead from "./tracks/TrackListHead";

const SearchResult = ({ containerRef }) => {
  const { query, hasSearchError } = useContext(SearchContext);
  return (
    <section className="search-result">
      <div className="search-result__header">
        <h2 className="search-result__title">
          <span className="search-result-highlight">{query}</span>
          {!hasSearchError ? "の検索結果" : "の検索結果が見つかりませんでした。"}
        </h2>
        <TrackListHead />
      </div>

      <SearchResultList containerRef={containerRef} />
    </section>
  );
};

export default SearchResult;
