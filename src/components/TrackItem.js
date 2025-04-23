import React from 'react';
import { playIcon, pauseIcon } from '../assets/icons';

const TrackItem = ({ track, index, isTrackPlaying, isClicked, setIsTrackSet, playerTrack, handleTrackSelect, formatTime }) => {
  return (
    <li
      key={index || track.id}
      className={`track-item ${isTrackPlaying ? 'playing' : ''} ${isClicked ? 'clicked' : ''}`}
      onClick={() => {
        playerTrack(track.trackUri || track.uri, isClicked);
        setIsTrackSet(true);
      }}
    >
      <div className="track-item__left">
        <button className="track-item__left-play-pause-button">
          <img src={isTrackPlaying ? pauseIcon : playIcon} className="track-item__left-play-pause-icon" alt="再生/一時停止" />
        </button>
        <div className={`equalizer ${isTrackPlaying ? '' : 'hidden'}`}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </div>
      <img src={track.albumImage || track.album.images[2]?.url} alt={track.title} className="track-item__cover-art" width="50" />
      <div className="track-item__track-info">
        <p className="track-item__title">{track.title || track.name}</p>
        <p className="track-item__artist">{track.artist || track.artists[0]?.name}</p>
      </div>
      <div className="track-item__right">
        <button
          className="track-item__add-button track-add-button"
          onClick={(e) => {
            e.stopPropagation();
            handleTrackSelect();
          }}
        >
          <img className="track-item__add-icon track-add-icon" src="/img/plus.png" alt="追加" />
        </button>
        <div className="track-item__track-duration">{formatTime(track.duration || track.duration_ms)}</div>
      </div>
    </li>
  );
};

export default TrackItem;
