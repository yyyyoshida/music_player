import React, { useContext } from 'react';
import { usePlayerContext } from './PlayerContext';
import { SearchContext } from './SearchContext';

const TrackList = () => {
  const { searchResults, setIsTrackSet } = useContext(SearchContext);
  const { playerTrack, formatTime, isStreaming, trackId } = usePlayerContext();

  return (
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
              // onClick={() => playerTrack(track.uri)}
              onClick={() => {
                playerTrack(track.uri);
                setIsTrackSet(true);
              }}
            >
              <div className="search-result__left">
                <div className={`equalizer ${isTrackPlaying ? '' : 'hidden'}`}>
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                </div>
              </div>
              <img className="search-result__cover-art" src={track.album.images[0]?.url} alt={track.name} width="50" />
              <div className="search-result__track-info">
                <p className="search-result__name">{track.name}</p>
                <p className="search-result__artist">{track.artists[0]?.name}</p>
              </div>
              <div className="search-result__right">
                <button className="search-result__button--add">
                  <img className="search-result__icon--add" src="img/plus.png" />
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
  );
};

export default TrackList;
