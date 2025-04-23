import React, { useContext, useState } from 'react';
import { usePlayerContext } from './PlayerContext';
import { SearchContext } from './SearchContext';
import { PlaylistSelectionContext } from './PlaylistSelectionContext';
import { playIcon, pauseIcon } from '../assets/icons';

const TrackList = () => {
  const { playerTrack, formatTime, isStreaming, trackId } = usePlayerContext();

  const { searchResults, setIsTrackSet } = useContext(SearchContext);
  const { handleSpotifyTrackSelect } = useContext(PlaylistSelectionContext);

  return (
    <>
      <ul className="search-result__list">
        {searchResults.length > 0 ? (
          searchResults.map((track) => {
            const isCurrentTrack = trackId === track.id;
            const isTrackPlaying = isCurrentTrack && isStreaming;
            const isClicked = isCurrentTrack;

            return (
              <li
                key={track.id}
                className={`search-result__item ${isTrackPlaying ? 'playing' : ''} ${isClicked ? 'clicked' : ''}`}
                onClick={() => {
                  playerTrack(track.uri, isClicked);
                  setIsTrackSet(true);
                }}
              >
                <div className="search-result__left">
                  <button className="search-result__left-play-pause-button">
                    <img src={isTrackPlaying ? pauseIcon : playIcon} className="search-result__left-play-pause-icon"></img>
                  </button>
                  <div className={`equalizer ${isTrackPlaying ? '' : 'hidden'}`}>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                  </div>
                </div>
                <img className="search-result__cover-art" src={track.album.images[2]?.url} alt={track.name} width="50" />
                <div className="search-result__track-info">
                  <p className="search-result__name">{track.name}</p>
                  <p className="search-result__artist">{track.artists[0]?.name}</p>
                </div>
                <div className="search-result__right">
                  <button
                    className="search-result__add-button track-add-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpotifyTrackSelect(track);
                    }}
                  >
                    <img className="search-result__add-icon track-add-icon" src="/img/plus.png" />
                  </button>
                  <div className="search-result__track-duration">{formatTime(track.duration_ms)}</div>
                </div>
              </li>
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
