import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlaylistContext } from "./PlaylistContext";
import useFetchPlaylists from "../hooks/useFetchPlaylists";
import { LoadingContext } from "../contexts/LoadingContext";
import { PlaylistSelectionContext } from "./PlaylistSelectionContext";
import { playIcon, pauseIcon } from "../assets/icons";
import CardListSkeleton from "./CardListSkeleton";

const Playlist = () => {
  const { toggleCreateVisible, formatTimeHours } = useContext(PlaylistContext);
  const { isSelectVisible } = useContext(PlaylistSelectionContext);
  const { isLoading } = useContext(LoadingContext);
  const { playlists } = useFetchPlaylists();
  const navigate = useNavigate();

  function handlePlaylistClick(playlistId) {
    navigate(`/playlist-detail/${playlistId}`);
  }

  return (
    <div className="playlists-page">
      <h2 className="playlists-page__title">プレイリスト</h2>
      <button className="playlists-page__create-button playlist-create-button" onClick={toggleCreateVisible}>
        ＋ 新規プレイリスト作成
      </button>
      {isLoading && !isSelectVisible && <CardListSkeleton />}

      <ul className={`playlists-page__list fade-on-loaded ${isLoading ? "" : "fade-in"}`}>
        {playlists.map((playlist) => {
          const isSingleImage = playlist.albumImages.length <= 3;
          const albumImagesToDisplay = [...playlist.albumImages].slice(0, 4);
          console.log("isSingleImage", isSingleImage, playlist.name, albumImagesToDisplay.length);
          return (
            <li key={playlist.id} className="playlists-page__item" onClick={() => handlePlaylistClick(playlist.id)}>
              <div className={`playlists-page__item-cover-img-wrapper ${isSingleImage ? "single" : ""}`}>
                {albumImagesToDisplay.map((src, i) => src && <img key={i} src={src} className={`playlists-page__item-cover-img img-${i}`} />)}

                <img
                  src="img/playlist-icon1.png"
                  className="playlists-page__item-initial-cover-img playlist-initial-cover-img"
                  style={{ visibility: playlist.trackCount === 0 ? "visible" : "hidden" }}
                />

                <button className="playlists-page__item-play-pause-button play-pause-button">
                  <img src={playIcon} className="playlists-page__item-play-pause-button-icon play-pause-button-icon play-button-icon" />
                </button>
              </div>
              <div className="playlists-page__item-info">
                <p className="playlists-page__item-name">{playlist.name}</p>
                <span className="playlists-page__item-meta">{`${playlist.trackCount}曲, ${formatTimeHours(playlist.totalDuration)}`}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Playlist;
