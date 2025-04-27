import React, { useContext, useState, useEffect } from 'react';
import { usePlayerContext } from './PlayerContext';
import { SearchContext } from './SearchContext';
import { PlaylistSelectionContext } from './PlaylistSelectionContext';
import TrackItem from './TrackItem';
import { LoadingContext } from '../contexts/LoadingContext';

const TrackList = () => {
  const { playerTrack, formatTime, isStreaming, trackId } = usePlayerContext();
  const { searchResults, setIsTrackSet } = useContext(SearchContext);
  const { handleTrackSelect, isSelectVisible } = useContext(PlaylistSelectionContext);
  const { isLoading } = useContext(LoadingContext);

  return (
    <>
      {isLoading && !isSelectVisible ? (
        <div className="loading">
          <div className="loading__content">
            <p className="loading__text">読み込み中</p>
            <div className="loading__spinner loader"></div>
          </div>
        </div>
      ) : (
        <div>
          <ul className="search-result__list">
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
                    setIsTrackSet={setIsTrackSet}
                    playerTrack={playerTrack}
                    formatTime={formatTime}
                    handleTrackSelect={() => handleTrackSelect(track, 'searchResults')}
                  />
                );
              })
            ) : (
              <li>検索結果がありません</li>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default TrackList;
