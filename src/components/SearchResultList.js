import React, { useContext, useState } from 'react';
import { usePlayerContext } from './PlayerContext';
import { SearchContext } from './SearchContext';
import { PlaylistSelectionContext } from './PlaylistSelectionContext';
import { playIcon, pauseIcon } from '../assets/icons';
import TrackItem from './TrackItem';

const TrackList = () => {
  const { playerTrack, formatTime, isStreaming, trackId } = usePlayerContext();

  const { searchResults, setIsTrackSet } = useContext(SearchContext);
  const { handleTrackSelect } = useContext(PlaylistSelectionContext);

  return (
    <>
      <ul className="search-result__list">
        {searchResults.length > 0 ? (
          searchResults.map((track) => {
            const isCurrentTrack = trackId === track.id;
            const isTrackPlaying = isCurrentTrack && isStreaming;
            const isClicked = isCurrentTrack;

            return (
              <TrackItem
                track={track}
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
    </>
  );
};

export default TrackList;
