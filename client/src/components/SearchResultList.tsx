import { useEffect, type RefObject } from "react";
import { useSearchContext } from "../contexts/SearchContext";
import usePlaybackStore from "../store/playbackStore";
import TrackItem from "./tracks/TrackItem";
import TrackListSkeleton from "./skeletonUI/TrackListSkeleton";
import { useSkeletonHandler } from "../hooks/useSkeletonHandler";

type TrackListProps = {
  containerRef: RefObject<HTMLDivElement | null>;
};

const TrackList = ({ containerRef }: TrackListProps) => {
  const { searchResults, isSearchLoading, query } = useSearchContext();
  const setTrackOrigin = usePlaybackStore.getState().setTrackOrigin;
  const SEARCH_LOADING_RELEASE_DELAY = 0;
  const isEmptySearchResults = searchResults.length === 0;

  const showSkeleton = useSkeletonHandler({ isDataLoading: isSearchLoading, loadingDelay: SEARCH_LOADING_RELEASE_DELAY, resetKey: query });

  useEffect(() => {
    containerRef.current?.scrollTo(0, 0);
    setTrackOrigin("searchResults");
  }, [query]);

  return (
    <>
      {showSkeleton && <TrackListSkeleton />}

      <ul className={`search-result__list fade-on-loaded ${showSkeleton ? "" : "fade-in-up"}`}>
        {isEmptySearchResults ? (
          <li>検索結果がありません</li>
        ) : (
          searchResults.map((track, index) => {
            return <TrackItem key={track.id + "-" + query} track={track} index={index} />;
          })
        )}
      </ul>
    </>
  );
};

export default TrackList;
