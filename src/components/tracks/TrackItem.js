import { useEffect, useContext, useRef, useState } from "react";
import { playIcon, pauseIcon, FALLBACK_COVER_IMAGE } from "../../assets/icons";
import { PlaybackContext } from "../../contexts/PlaybackContext";
import { TrackMoreMenuContext } from "../../contexts/TrackMoreMenuContext";
import { PlaylistSelectionContext } from "../../contexts/PlaylistSelectionContext";
import { usePlayerContext } from "../../contexts/PlayerContext";
import TrackSourceIcon from "../TrackSourceIcon";

const TrackItem = ({ track, index, isTrackPlaying, playerTrack, formatTime, date, query }) => {
  const { updateCurrentIndex, setCurrentPlayedAt, currentTrackId, setCurrentTrackId } = useContext(PlaybackContext);
  const { setIsButtonHovered, setMenuPositionTop, toggleMenu, setTrackId, setTrackIndex } = useContext(TrackMoreMenuContext);
  const { handleTrackSelect } = useContext(PlaylistSelectionContext);
  const { setIsTrackSet, trackOrigin, togglePlayPause } = usePlayerContext();

  const isCurrentTrack = currentTrackId === track.id;
  const buttonRef = useRef(null);

  const delayedIsClicked = useDelayedValue(isCurrentTrack);
  const delayedIsTrackPlaying = useDelayedValue(isTrackPlaying);

  const resolvedIsPlaying = trackOrigin === "firebase" ? delayedIsTrackPlaying : isTrackPlaying;
  const resolvedIsClicked = trackOrigin === "firebase" ? delayedIsClicked : isCurrentTrack;

  const positionOffsetY = -60;

  const isUsedFallbackImage = track.albumImage === FALLBACK_COVER_IMAGE;

  function useDelayedValue(value, delay = 200) {
    const [delayedValue, setDelayedValue] = useState(value);

    useEffect(() => {
      if (trackOrigin === "searchResults") return;
      const timeout = setTimeout(() => {
        setDelayedValue(value);
      }, delay);

      return () => clearTimeout(timeout);
    }, [value]);

    return delayedValue;
  }

  function setButtonPosition() {
    const rect = buttonRef.current.getBoundingClientRect();
    const newPositionTop = rect.top + positionOffsetY;

    if (newPositionTop >= 10) {
      setMenuPositionTop(newPositionTop);
    } else {
      setMenuPositionTop(10);
    }
  }

  function handleClickTrackItem() {
    if (isCurrentTrack) return togglePlayPause();
    playNewTrack();
  }

  function playNewTrack() {
    const uri = track.trackUri || track.uri || track.audioURL;

    if (!uri) return console.warn("再生不可");

    setIsTrackSet(true);
    updateCurrentIndex(index);
    setCurrentTrackId(track.id);
    setCurrentPlayedAt(date);
    playerTrack(uri, track.source);
  }

  return (
    <li className={`track-item ${resolvedIsPlaying ? "playing" : ""} ${resolvedIsClicked ? "clicked" : ""} `} onClick={handleClickTrackItem}>
      <div className="track-item__left">
        <div className={`${track.trackId}`}></div>
        <button className="track-item__left-play-pause-button">
          <img src={resolvedIsPlaying ? pauseIcon : playIcon} className="track-item__left-play-pause-icon" alt="再生/一時停止" />
        </button>

        <div className={`equalizer ${resolvedIsPlaying ? "" : "hidden"}`}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </div>

      <div className="track-item__cover-art-wrapper">
        <img
          src={track.albumImage || track.album.images[2]?.url}
          alt={track.title}
          className={`track-item__cover-art track-item__cover ${isUsedFallbackImage ? "track-item__initial-cover" : ""}`}
          width="50px"
          height="50px"
          key={track.id + "-" + query}
          loading={index >= 10 ? "lazy" : "eager"}
        />
      </div>
      <div className="track-item__track-info">
        <p className="track-item__title">{track.title || track.name}</p>
        <p className="track-item__artist">{track.artist || track.artists[0]?.name}</p>
      </div>
      <div className="track-item__right">
        {track.source && <TrackSourceIcon source={track.source} />}
        <button
          className="track-item__more-button track-menu-button"
          ref={buttonRef}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            setButtonPosition();
            handleTrackSelect(track, false);
            toggleMenu(index);

            setTrackIndex(index);
            setTrackId(track.id);
          }}
        >
          <img className="track-item__more-icon track-menu-button-icon" src="/img/more.png" />
        </button>
        <div className="track-item__track-duration">{formatTime(track.duration_ms)}</div>
      </div>
    </li>
  );
};

export default TrackItem;
