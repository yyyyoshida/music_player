import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PlaylistContext } from "../../contexts/PlaylistContext";
import useFetchPlaylists from "../../hooks/useFetchPlaylists";
import PlaylistCoverImageGrid from "./PlaylistCoverImageGrid";

import { playIcon, FALLBACK_COVER_IMAGE } from "../../assets/icons";
import CardListSkeleton from "../skeletonUI/CardListSkeleton";
import useWaitForImagesLoad from "../../hooks/useWaitForImagesLoad";

const Playlist = () => {
  const { toggleCreateVisible, formatTimeHours } = useContext(PlaylistContext);

  const { playlists } = useFetchPlaylists();
  const navigate = useNavigate();

  const imagesLoaded = useWaitForImagesLoad("playlistCover", playlists, [playlists]);

  function handlePlaylistClick(playlistId) {
    navigate(`/playlist-detail/${playlistId}`);
  }

  return (
    <div className="playlists-page">
      <h2 className="playlists-page__title">プレイリスト</h2>
      <button className="playlists-page__create-button playlist-create-button" onClick={toggleCreateVisible}>
        ＋ 新規プレイリスト作成
      </button>

      {!imagesLoaded && <CardListSkeleton />}

      <ul className={`playlists-page__list fade-on-loaded ${imagesLoaded ? "fade-in-up" : ""}`}>
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
