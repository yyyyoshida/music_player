import React, { useContext, useState, useEffect } from "react";
import { usePlayerContext } from "./PlayerContext";
import { SearchContext } from "./SearchContext";
import { PlaylistSelectionContext } from "./PlaylistSelectionContext";
import { PlaylistContext } from "./PlaylistContext";
import TrackItem from "./TrackItem";
import { LoadingContext } from "../contexts/LoadingContext";
import TrackListSkeleton from "./TrackListSkeleton";

const TrackList = () => {
  const { playerTrack, formatTime, isStreaming, trackId } = usePlayerContext();
  const { searchResults } = useContext(SearchContext);
  const { isSelectVisible } = useContext(PlaylistSelectionContext);
  const { isLoading } = useContext(LoadingContext);
  const [shouldFadeIn, setShouldFadeIn] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  // const { totalDuration } = useContext(PlaylistContext);

  // console.log(totalDuration);

  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        setShouldFadeIn(true);
        setShowSkeleton(false);
      }, 100);

      return () => clearTimeout(timeoutId);
    } else {
      setShouldFadeIn(false);
      setShowSkeleton(true);
    }
  }, [isLoading]);

  return (
    <>
      {showSkeleton && !isSelectVisible && <TrackListSkeleton />}

      <div>
        <ul className={`search-result__list fade-on-loaded ${shouldFadeIn ? "fade-in-up" : ""}`}>
          {/* <ul className={`search-result__list fade-on-loaded ${shouldFadeIn ? "fade-reveal" : ""}`}> */}
          {searchResults.length > 0 ? (
            searchResults.map((track, index) => {
              const isCurrentTrack = trackId === track.id;
              const isTrackPlaying = isCurrentTrack && isStreaming;
              const isClicked = isCurrentTrack;

              return (
                <TrackItem
                  key={track.id}
                  track={track}
                  index={index}
                  isCurrentTrack={isCurrentTrack}
                  isTrackPlaying={isTrackPlaying}
                  isClicked={isClicked}
                  // setIsTrackSet={setIsTrackSet}
                  playerTrack={playerTrack}
                  formatTime={formatTime}
                  type={"searchResults"}
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
