import { useEffect, useContext, useRef, useState } from "react";
import { playIcon, pauseIcon } from "../../assets/icons";
import { PlaybackContext } from "../../contexts/PlaybackContext";
import { TrackMoreMenuContext } from "../../contexts/TrackMoreMenuContext";
import { PlaylistSelectionContext } from "../../contexts/PlaylistSelectionContext";
import { usePlayerContext } from "../../contexts/PlayerContext";
import TrackSourceIcon from "../TrackSourceIcon";

const TrackItem = ({ track, index, isTrackPlaying, isClicked, playerTrack, formatTime, type, date, query }) => {
  const { playTrackAt, setCurrentPlayedAt, currentTrackId, setCurrentTrackId } = useContext(PlaybackContext);
  const { setIsButtonHovered, setMenuPositionTop, toggleMenu, setTrackId, setTrackIndex } = useContext(TrackMoreMenuContext);
  const { handleTrackSelect } = useContext(PlaylistSelectionContext);
  const { setIsClickedTrack, setIsTrackSet, setCurrentAudioURL } = usePlayerContext();

  const buttonRef = useRef(null);

  const delayedIsClicked = useDelayedValue(isClicked);
  const delayedIsTrackPlaying = useDelayedValue(isTrackPlaying);

  const resolvedIsPlaying = type === "firebase" ? delayedIsTrackPlaying : isTrackPlaying;
  const resolvedIsClicked = type === "firebase" ? delayedIsClicked : isClicked;

  const positionOffsetY = -60;

  const isDefaultImage = track.albumImage === "/img/デフォルト画像.png";

  // function useDelayedValue(value, delay = 200) {
  function useDelayedValue(value, delay = 200) {
    const [delayedValue, setDelayedValue] = useState(value);

    useEffect(() => {
      if (type === "searchResults") return;
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

  return (
    <li
      className={`track-item ${resolvedIsPlaying ? "playing" : ""} ${resolvedIsClicked ? "clicked" : ""} `}
      onClick={() => {
        playerTrack(track.trackUri || track.uri || track.audioURL, isClicked, track.source);
        setIsTrackSet(true);
        playTrackAt(index);
        setCurrentTrackId(track.id);
        setCurrentAudioURL(track.audioURL);
        setCurrentPlayedAt(date);
        setIsClickedTrack(isClicked);
      }}
    >
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
      {isDefaultImage ? (
        <div className="track-item__default-cover-art-wrapper track-item__cover">
          <img
            src="/img/music-24.png"
            alt="デフォルト画像"
            className="track-item__default-cover-art"
            width="16px"
            height="16px"
            key={track.id + "-" + query}
            loading={index >= 10 ? "lazy" : "eager"}
          />
        </div>
      ) : (
        <img
          src={track.albumImage || track.album.images[2]?.url}
          alt={track.title}
          className="track-item__cover-art track-item__cover"
          width="50px"
          height="50px"
          key={track.id + "-" + query}
          loading={index >= 10 ? "lazy" : "eager"}
        />
      )}
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
