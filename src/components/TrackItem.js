import React, { useEffect, useContext, useRef, useState } from "react";
import { playIcon, pauseIcon } from "../assets/icons";
import { PlaybackContext } from "../contexts/PlaybackContext";
import { TrackMoreMenuContext } from "../contexts/TrackMoreMenuContext";
import { PlaylistSelectionContext } from "./PlaylistSelectionContext";
import { usePlayerContext } from "./PlayerContext";

const TrackItem = ({ track, index, isTrackPlaying, isClicked, playerTrack, formatTime, type }) => {
  const { playTrackAt } = useContext(PlaybackContext);
  const { setIsButtonHovered, setMenuPositionTop, toggleMenu, setTrackId, setTrackIndex } = useContext(TrackMoreMenuContext);
  const { handleTrackSelect } = useContext(PlaylistSelectionContext);
  const { setIsTrackSet } = usePlayerContext();

  const buttonRef = useRef(null);

  const positionOffsetY = -60;

  function setButtonPosition() {
    const rect = buttonRef.current.getBoundingClientRect();
    const newPositionTop = rect.top + positionOffsetY;

    if (newPositionTop >= 10) {
      setMenuPositionTop(newPositionTop);
    } else {
      setMenuPositionTop(10);
    }
  }

  return (
    <li
      // key={`${track.addedAt?.seconds || track.id}`}
      className={`track-item ${isTrackPlaying ? "playing" : ""} ${isClicked ? "clicked" : ""}`}
      onClick={() => {
        playerTrack(track.trackUri || track.uri, isClicked);
        setIsTrackSet(true);
        playTrackAt(index);
      }}
    >
      {/* {`${track.addedAt?.seconds}`} */}
      {/* {track.id} */}
      <div className="track-item__left">
        <div className={`${track.trackId}`}></div>
        <button className="track-item__left-play-pause-button">
          <img src={isTrackPlaying ? pauseIcon : playIcon} className="track-item__left-play-pause-icon" alt="再生/一時停止" />
        </button>
        <div className={`equalizer ${isTrackPlaying ? "" : "hidden"}`}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </div>
      <img
        src={track.albumImage || track.album.images[2]?.url}
        alt={track.title}
        className="track-item__cover-art"
        width="50"
        loading={index >= 10 ? "lazy" : "eager"}
      />
      <div className="track-item__track-info">
        <p className="track-item__title">{track.title || track.name}</p>
        <p className="track-item__artist">{track.artist || track.artists[0]?.name}</p>
      </div>
      <div className="track-item__right">
        <button
          className="track-item__more-button track-menu-button"
          ref={buttonRef}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            setButtonPosition();
            handleTrackSelect(track, type, false);
            toggleMenu(index);

            setTrackIndex(index);
            setTrackId(track.id);
          }}
        >
          <img className="track-item__more-icon track-menu-button-icon" src="/img/more.png" />
        </button>
        <div className="track-item__track-duration">{formatTime(track.duration || track.duration_ms)}</div>
      </div>
    </li>
  );
};

export default TrackItem;
