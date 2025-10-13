import { useEffect, type RefObject } from "react";
import { useSearchContext } from "../contexts/SearchContext";
import usePlaybackStore from "../store/playbackStore";
import TrackItem from "./tracks/TrackItem";
import TrackListSkeleton from "./skeletonUI/TrackListSkeleton";
import useWaitForImagesLoad from "../hooks/useWaitForImagesLoad";
import { useSkeletonHandler } from "../hooks/useSkeletonHandler";

type TrackListProps = {
  containerRef: RefObject<HTMLDivElement>;
};

const TrackList = ({ containerRef }: TrackListProps) => {
  const { searchResults, query } = useSearchContext();
  const setTrackOrigin = usePlaybackStore((state) => state.setTrackOrigin);

  const IMAGES_LOADED_COUNT = 10;
  const LOADING_DELAY = 100;
  const isEmptySearchResults = searchResults.length === 0;

  const { imagesLoaded } = useWaitForImagesLoad("trackList", searchResults, [searchResults], LOADING_DELAY, IMAGES_LOADED_COUNT);
  const showSkeleton = useSkeletonHandler({ imagesLoaded, resetKey: query });

  useEffect(() => {
    containerRef.current.scrollTo(0, 0);
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
