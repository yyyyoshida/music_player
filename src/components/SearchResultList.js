import { useContext, useEffect } from "react";
import { usePlayerContext } from "../contexts/PlayerContext";
import { SearchContext } from "../contexts/SearchContext";
import usePlaybackStore from "../store/playbackStore";
import TrackItem from "./tracks/TrackItem";
import TrackListSkeleton from "./skeletonUI/TrackListSkeleton";
import useWaitForImagesLoad from "../hooks/useWaitForImagesLoad";
import { useSkeletonHandler } from "../hooks/useSkeletonHandler";

const TrackList = ({ containerRef }) => {
  const { searchResults, query } = useContext(SearchContext);
  const { formatTime, setTrackOrigin } = usePlayerContext();
  const currentTrackId = usePlaybackStore((state) => state.currentTrackId);

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
            const isCurrentTrack = currentTrackId === track.id;
            const isClicked = isCurrentTrack;

            return (
              <TrackItem
                key={track.id + "-" + query}
                track={track}
                index={index}
                isCurrentTrack={isCurrentTrack}
                isClicked={isClicked}
                formatTime={formatTime}
                query={query}
              />
            );
          })
        )}
      </ul>
    </>
  );
};

export default TrackList;
