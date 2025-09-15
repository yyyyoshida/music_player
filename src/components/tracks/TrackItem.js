import { useRef, useState } from "react";
import { playIcon, pauseIcon, FAVORITE_ICON, ADD_TO_PLAYLIST_ICON, FALLBACK_COVER_IMAGE } from "../../assets/icons";
import usePlayerStore from "../../store/playerStore";
import useTooltipStore from "../../store/tooltipStore";
import usePlaybackStore from "../../store/playbackStore";
import useTrackMoreMenuStore from "../../store/trackMoreMenuStore";
import useActionSuccessMessageStore from "../../store/actionSuccessMessageStore";
import usePlaylistSelectionStore from "../../store/playlistSelectionStore";
import TrackSourceIcon from "../TrackSourceIcon";
import { isFallback } from "../../utils/isFallback";
import { formatTime } from "../../utils/formatTime";

const TrackItem = ({ track, index, date, query, parentRef }) => {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playDisable = usePlayerStore((state) => state.playDisable);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const playerTrack = usePlayerStore((state) => state.playerTrack);
  const setIsTrackSet = usePlayerStore((state) => state.setIsTrackSet);

  const setTooltipText = useTooltipStore((state) => state.setTooltipText);
  const handleButtonPress = useTooltipStore((state) => state.handleButtonPress);
  const handleMouseEnter = useTooltipStore((state) => state.handleMouseEnter);
  const handleMouseLeave = useTooltipStore((state) => state.handleMouseLeave);

  const currentTrackId = usePlaybackStore((state) => state.currentTrackId);
  const setCurrentTrackId = usePlaybackStore((state) => state.setCurrentTrackId);
  const setCurrentIndex = usePlaybackStore((state) => state.setCurrentIndex);
  const setCurrentPlayedAt = usePlaybackStore((state) => state.setCurrentPlayedAt);

  const setMenuTrackId = useTrackMoreMenuStore((state) => state.setMenuTrackId);
  const setTrackMenuPositionTop = useTrackMoreMenuStore((state) => state.setTrackMenuPositionTop);
  const toggleTrackMenu = useTrackMoreMenuStore((state) => state.toggleTrackMenu);

  const openPlaylistSelectModal = usePlaylistSelectionStore((state) => state.openPlaylistSelectModal);
  const handleTrackSelect = usePlaylistSelectionStore((state) => state.handleTrackSelect);

  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

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
    setTrackMenuPositionTop(offset);
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
                openPlaylistSelectModal();
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
              toggleTrackMenu(index);
              handleButtonPress();
              setMenuTrackId(track.id);
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
