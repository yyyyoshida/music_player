import { useLocation } from "react-router-dom";
import { playIcon, pauseIcon } from "../../assets/icons";
import useTrackMoreMenuStore from "../../store/trackMoreMenuStore";
import usePlaylistSelectionStore from "../../store/playlistSelectionStore";
import useActionSuccessMessageStore from "../../store/actionSuccessMessageStore";
import TrackSourceIcon from "../TrackSourceIcon";
import TrackActionButton from "./TrackActionButton";
import { isFallback } from "../../utils/isFallback";
import { formatTime } from "../../utils/formatTime";
import useTrackItem from "../../hooks/useTrackItem";

const TrackItem = ({ track, index, date, query, parentRef }) => {
  const setMenuTrackId = useTrackMoreMenuStore((state) => state.setMenuTrackId);
  const toggleTrackMenu = useTrackMoreMenuStore((state) => state.toggleTrackMenu);

  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);
  const openPlaylistSelectModal = usePlaylistSelectionStore((state) => state.openPlaylistSelectModal);
  const handleTrackSelect = usePlaylistSelectionStore((state) => state.handleTrackSelect);

  const isUsedFallbackImage = isFallback(track.albumImage);
  const location = useLocation();
  const isSearchPage = location.pathname === "/search-result";
  const { buttonRef, isCurrentTrack, isActiveTrack, handleClickTrackItem, setButtonPosition } = useTrackItem(track, index, date, parentRef);

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
            <TrackActionButton
              type={"favorite"}
              clickAction={() => {
                showMessage("未実装");
              }}
            />

            <TrackActionButton
              type={"add-playlist"}
              clickAction={() => {
                handleTrackSelect(track, false);
                openPlaylistSelectModal();
              }}
            />
          </>
        ) : (
          <TrackActionButton
            type={"more"}
            clickAction={() => {
              setButtonPosition();
              handleTrackSelect(track, false);
              toggleTrackMenu(index);
              setMenuTrackId(track.id);
            }}
            buttonRef={buttonRef}
          />
        )}
        <div className="track-item__track-duration">{formatTime(track.duration_ms)}</div>
      </div>
    </li>
  );
};

export default TrackItem;
