import React, { useContext, useState, useEffect } from "react";
import { usePlayerContext } from "./PlayerContext";
import { SearchContext } from "./SearchContext";
import { PlaylistSelectionContext } from "./PlaylistSelectionContext";
import TrackItem from "./TrackItem";
import { LoadingContext } from "../contexts/LoadingContext";
import TrackListSkeleton from "./TrackListSkeleton";

const TrackList = ({ containerRef }) => {
  const { playerTrack, formatTime, isStreaming, trackId } = usePlayerContext();
  const { searchResults, query } = useContext(SearchContext);
  const { isSelectVisible } = useContext(PlaylistSelectionContext);
  const { isSearchLoading } = useContext(LoadingContext);

  const [initialLoaded, setInitialLoaded] = useState(false);
  const INITIAL_RENDER_COUNT = 10;

  // const { totalDuration } = useContext(PlaylistContext);

  // console.log(totalDuration);

  useEffect(() => {
    containerRef.current.scrollTo(0, 0);
    setInitialLoaded(false);
  }, [query]);

  const waitForAllImagesToLoad = (imageUrls) => {
    return Promise.all(
      imageUrls.map((url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        });
      })
    );
  };

  useEffect(() => {
    if (!searchResults.length) return;

    setInitialLoaded(false);

    const first10Urls = searchResults
      .slice(0, INITIAL_RENDER_COUNT)
      .map((track) => track.album.images[0]?.url)
      .filter(Boolean);

    waitForAllImagesToLoad(first10Urls).then(() => {
      console.log("✅ すべての画像読み込み完了！");
      setInitialLoaded(true);
    });
  }, [searchResults]);

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
