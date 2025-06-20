import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PlaylistContext } from "../../contexts/PlaylistContext";
import useFetchPlaylists from "../../hooks/useFetchPlaylists";
import PlaylistCoverImageGrid from "./PlaylistCoverImageGrid";

import { playIcon, FALLBACK_COVER_IMAGE } from "../../assets/icons";
import CardListSkeleton from "../skeletonUI/CardListSkeleton";
import useWaitForImagesLoad from "../../hooks/useWaitForImagesLoad";
import { useSkeletonHandler } from "../../hooks/useSkeletonHandler";

const Playlist = () => {
  const { showCreatePlaylistModal, formatTimeHours } = useContext(PlaylistContext);
  const { playlists } = useFetchPlaylists();
  const navigate = useNavigate();

  const LOADING_DELAY = 250;
  const isPlaylistsEmpty = playlists.length === 0;

  const { imagesLoaded, isImageListEmpty } = useWaitForImagesLoad("playlistCover", playlists, [playlists], LOADING_DELAY);
  const showSkeleton = useSkeletonHandler({ isImageListEmpty, imagesLoaded });

  function handlePlaylistClick(playlistId) {
    navigate(`/playlist-detail/${playlistId}`);
  }

  return (
    <div className="playlists-page">
      <h2 className="playlists-page__title">プレイリスト</h2>
      <button className="playlists-page__create-button playlist-create-button" onClick={showCreatePlaylistModal}>
        ＋ 新規プレイリスト作成
      </button>

      <div className="playlists-page__empty-message-wrapper empty-message-wrapper">
        <p className={`playlists-page__empty-message  fade-on-loaded ${showSkeleton || !isPlaylistsEmpty ? "" : "fade-in-up"}`}>
          表示できるプレイリストがありません
        </p>
      </div>
      {showSkeleton && <CardListSkeleton />}

      <ul className={`playlists-page__list fade-on-loaded ${showSkeleton ? "" : "fade-in-up"}`}>
        {playlists.map((playlist) => {
          const isSingleImage = playlist.albumImages.length <= 3;
          const firstTrackIsFallbackImage = playlist.trackCount === 0 || (isSingleImage && playlist.albumImages[0] === FALLBACK_COVER_IMAGE);

          return (
            <li key={playlist.id} className="playlists-page__item" onClick={() => handlePlaylistClick(playlist.id)}>
              <div className="playlists-page__item-cover-wrapper">
                <PlaylistCoverImageGrid
                  images={playlist.albumImages}
                  wrapperClassName={`playlists-page__item-cover-img-wrapper ${isSingleImage ? "single" : ""}`}
                  fallbackImgWrapperClassName="header-cover-fallback-wrapper"
                  fallbackImgClassName="playlist-cover-fallback"
                  imgClassName="playlists-page__item-cover-img"
                />

                <img
                  src={FALLBACK_COVER_IMAGE}
                  className="playlists-page__item-initial-cover-img playlist-initial-cover-img"
                  style={{ visibility: firstTrackIsFallbackImage ? "visible" : "hidden" }}
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
