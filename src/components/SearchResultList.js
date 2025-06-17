import { useContext, useState, useEffect } from "react";
import { usePlayerContext } from "../contexts/PlayerContext";
import { SearchContext } from "../contexts/SearchContext";
import TrackItem from "./tracks/TrackItem";
import TrackListSkeleton from "./skeletonUI/TrackListSkeleton";
import useWaitForImagesLoad from "../hooks/useWaitForImagesLoad";

const TrackList = ({ containerRef }) => {
  const { searchResults, query } = useContext(SearchContext);
  const { playerTrack, formatTime, isPlaying, trackId, setTrackOrigin } = usePlayerContext();

  const IMAGES_LOADED_COUNT = 10;
  const SKELETON_TIME = 100;
  const isEmptySearchResults = searchResults.length === 0;

  const [showSkeleton, setShowSkeleton] = useState(true);
  const imagesLoaded = useWaitForImagesLoad("trackList", searchResults, [searchResults], SKELETON_TIME, IMAGES_LOADED_COUNT);

  useEffect(() => {
    containerRef.current.scrollTo(0, 0);

    setShowSkeleton(true);

    setTrackOrigin("searchResults");
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!imagesLoaded) {
        setShowSkeleton(true);
      } else {
        setShowSkeleton(false);
      }
    }, SKELETON_TIME);

    return () => clearTimeout(timer);
  }, [imagesLoaded, isEmptySearchResults]);
  return (
    <>
      {showSkeleton && <TrackListSkeleton />}

      <ul className={`search-result__list fade-on-loaded ${showSkeleton ? "" : "fade-in-up"}`}>
        {isEmptySearchResults ? (
          <li>検索結果がありません</li>
        ) : (
          searchResults.map((track, index) => {
            const isCurrentTrack = trackId === track.id;
            const isTrackPlaying = isCurrentTrack && isPlaying;
            const isClicked = isCurrentTrack;

            return (
              <TrackItem
                key={track.id + "-" + query}
                track={track}
                index={index}
                isCurrentTrack={isCurrentTrack}
                isTrackPlaying={isTrackPlaying}
                isClicked={isClicked}
                playerTrack={playerTrack}
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
