import { useContext, useRef, useState } from "react";
import { playIcon, pauseIcon, FAVORITE_ICON, ADD_TO_PLAYLIST_ICON } from "../../assets/icons";
import { PlaybackContext } from "../../contexts/PlaybackContext";
import { TrackMoreMenuContext } from "../../contexts/TrackMoreMenuContext";
import { PlaylistSelectionContext } from "../../contexts/PlaylistSelectionContext";
import { usePlayerContext } from "../../contexts/PlayerContext";
import TrackSourceIcon from "../TrackSourceIcon";
import { TooltipContext } from "../../contexts/TooltipContext";
import { isFallback } from "../../utils/isFallback";
import ActionSuccessMessageContext from "../../contexts/ActionSuccessMessageContext";

const TrackItem = ({ track, index, playerTrack, formatTime, date, query, parentRef }) => {
  const { setCurrentIndex, updateCurrentIndex, setCurrentPlayedAt, currentTrackId, setCurrentTrackId } = useContext(PlaybackContext);
  const { setIsButtonHovered, setMenuPositionTop, toggleMenu, setTrackId, setTrackIndex } = useContext(TrackMoreMenuContext);
  const { handleTrackSelect, toggleSelectVisible } = useContext(PlaylistSelectionContext);
  const { setIsTrackSet, togglePlayPause, stopPlayback, playDisable, isPlaying } = usePlayerContext();
  const { handleButtonPress, handleMouseEnter, handleMouseLeave, setTooltipText } = useContext(TooltipContext);
  const { showMessage } = useContext(ActionSuccessMessageContext);
  const [pendingTrackId, setPendingTrackId] = useState(null);

  const buttonRef = useRef(null);
  const isCurrentTrack = currentTrackId === track.id;
  const isUsedFallbackImage = isFallback(track.albumImage);
  const positionOffsetY = -60;
  const isSearchPage = window.location.pathname === "/search-result";
  const isActiveTrack = (currentTrackId === track.id && isPlaying) || pendingTrackId === track.id;

  function handleClickTrackItem() {
    if (playDisable) {
      showMessage("tooFrequent");
      return;
    }

    if (isCurrentTrack) {
      togglePlayPause();
      return;
    }
    setPendingTrackId(track.id);
    playNewTrack();
  }

  function playNewTrack() {
    stopPlayback();

    const uri = track.trackUri || track.uri || track.audioURL;

    if (!uri) return console.warn("再生不可");

    setIsTrackSet(true);
    setCurrentIndex(index);
    setCurrentTrackId(track.id);
    setCurrentPlayedAt(date);
    setPendingTrackId(null);
    playerTrack(uri, track.source);
  }

  function setButtonPosition() {
    if (!buttonRef.current || !parentRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const parentRect = parentRef.current.getBoundingClientRect();

    const offset = buttonRect.top - parentRect.top + window.scrollY + positionOffsetY;
    setMenuPositionTop(offset);
  }

  return (
    <li className={`track-item ${isActiveTrack ? "playing" : ""} ${isCurrentTrack ? "clicked" : ""} `} onClick={handleClickTrackItem}>
      <div className="track-item__left">
        <button className="track-item__left-play-pause-button">
          <img src={isActiveTrack ? pauseIcon : playIcon} className="track-item__left-play-pause-icon" alt="再生/一時停止" />
        </button>

        <div className={`equalizer ${isActiveTrack ? "" : "hidden"}`}>
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
        {isSearchPage ? (
          <>
            <button
              className="track-item__button track-item__favorite-button"
              onClick={(e) => {
                e.stopPropagation();
                handleButtonPress();
              }}
              onMouseEnter={(e) => {
                setTooltipText("お気入りに追加");
                handleMouseEnter(e);
              }}
              onMouseLeave={() => {
                handleMouseLeave();
              }}
            >
              <img src={FAVORITE_ICON} />
            </button>
            <button
              className="track-item__button track-item__add-playlist-button"
              onClick={(e) => {
                e.stopPropagation();
                handleTrackSelect(track, false);
                toggleSelectVisible();
              }}
              onMouseEnter={(e) => {
                setTooltipText("プレイリストに追加");
                handleMouseEnter(e);
              }}
              onMouseLeave={() => {
                handleMouseLeave();
              }}
            >
              <img src={ADD_TO_PLAYLIST_ICON} />
            </button>
          </>
        ) : (
          <button
            className="track-item__button track-item__more-button "
            ref={buttonRef}
            onMouseEnter={(e) => {
              setTooltipText("プレイリストに追加");
              handleMouseEnter(e);
            }}
            onMouseLeave={() => {
              handleMouseLeave();
            }}
            onClick={(e) => {
              e.stopPropagation();
              setButtonPosition();
              handleTrackSelect(track, false);
              toggleMenu(index);
              handleButtonPress();
              setTrackIndex(index);
              setTrackId(track.id);
            }}
          >
            <img className="track-item__more-icon track-menu-button-icon" src="/img/more.png" />
          </button>
        )}
        <div className="track-item__track-duration">{formatTime(track.duration_ms)}</div>
      </div>
    </li>
  );
};

export default TrackItem;
