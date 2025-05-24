import { useContext, useState, useEffect } from "react";
import { usePlayerContext } from "../contexts/PlayerContext";
import { SearchContext } from "../contexts/SearchContext";
import { PlaylistSelectionContext } from "../contexts/PlaylistSelectionContext";
import TrackItem from "./tracks/TrackItem";
import TrackListSkeleton from "./skeletons/TrackListSkeleton";
import useWaitForImagesLoad from "../hooks/useWaitForImagesLoad";

const TrackList = ({ containerRef }) => {
  const { playerTrack, formatTime, isStreaming, trackId } = usePlayerContext();
  const { searchResults, query } = useContext(SearchContext);
  const { isSelectVisible } = useContext(PlaylistSelectionContext);

  const [initialLoaded, setInitialLoaded] = useState(false);

  const imagesLoaded = useWaitForImagesLoad("trackList", searchResults, [searchResults]);

  // const { totalDuration } = useContext(PlaylistContext);

  // console.log(totalDuration);

  useEffect(() => {
    containerRef.current.scrollTo(0, 0);
    setInitialLoaded(false);
  }, [query]);

  useEffect(() => {
    if (imagesLoaded) {
      setInitialLoaded(true);
    }
  }, [imagesLoaded]);

  return (
    <>
      {!initialLoaded && !isSelectVisible && <TrackListSkeleton />}

      <div>
        <ul className={`search-result__list fade-on-loaded ${initialLoaded ? "fade-in-up" : ""}`}>
          {searchResults.length > 0 ? (
            searchResults.map((track, index) => {
              const isCurrentTrack = trackId === track.id;
              const isTrackPlaying = isCurrentTrack && isStreaming;
              const isClicked = isCurrentTrack;

              return (
                <TrackItem
                  key={track.id + "-" + query}
                  track={track}
                  index={index}
                  isCurrentTrack={isCurrentTrack}
                  isTrackPlaying={isTrackPlaying}
                  isClicked={isClicked}
                  // setIsTrackSet={setIsTrackSet}
                  playerTrack={playerTrack}
                  formatTime={formatTime}
                  type={"searchResults"}
                  query={query}
                />
              );
            })
          ) : (
            <li>検索結果がありません</li>
          )}
        </ul>
      </div>
    </>
  );
};

export default TrackList;
