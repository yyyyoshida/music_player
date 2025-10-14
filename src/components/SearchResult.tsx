import type { RefObject } from "react";
import SearchResultList from "./SearchResultList";
import { useSearchContext } from "../contexts/SearchContext";
import TrackListHead from "./tracks/TrackListHead";

type SearchResultProps = {
  containerRef: RefObject<HTMLDivElement | null>;
};

const SearchResult = ({ containerRef }: SearchResultProps) => {
  const { query, hasSearchError } = useSearchContext();
  return (
    <section className="search-result">
      <div className="search-result__header">
        <h2 className="search-result__title">
          <span className="search-result-highlight">{query}</span>
          {!hasSearchError ? "の検索結果" : "の検索に失敗しました。"}
        </h2>
        <TrackListHead />
      </div>

      <SearchResultList containerRef={containerRef} />
    </section>
  );
};

export default SearchResult;
