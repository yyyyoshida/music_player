import { useState, useEffect, useContext } from "react";
import { PlaylistSelectionContext } from "../../contexts/PlaylistSelectionContext";
import { PlaylistContext } from "../../contexts/PlaylistContext";
import useFetchPlaylists from "../../hooks/useFetchPlaylists";

import PlaylistSelectSkeleton from "../skeletonUI/PlaylistSelectSkeleton";
import useWaitForImagesLoad from "../../hooks/useWaitForImagesLoad";
import { FALLBACK_COVER_IMAGE } from "../../assets/icons";
import PlaylistCoverImageGrid from "./PlaylistCoverImageGrid";

const PlaylistSelection = () => {
  const [showSkeleton, setShowSkeleton] = useState(true);

  const { isSelectVisible, toggleSelectVisible, addTrackToPlaylist } = useContext(PlaylistSelectionContext);
  const { toggleCreateVisible } = useContext(PlaylistContext);
  const { playlists } = useFetchPlaylists();
  const imagesLoaded = useWaitForImagesLoad("playlistCover", playlists, [playlists], 0);

  const isPlaylistsEmpty = playlists.length === 0;

  useEffect(() => {
    if (isPlaylistsEmpty) {
      setShowSkeleton(false);
      return;
    }

    if (imagesLoaded) {
      setShowSkeleton(false);
    } else {
      setShowSkeleton(true);
    }
  }, []);

  return (
    <div className="playlist-selection modal" style={{ visibility: isSelectVisible ? "visible" : "hidden" }}>
      <div className="playlist-selection__smoke modal-smoke">
        <div className="playlist-selection__content modal-content">
          <button className="playlist-selection__close-button" onClick={toggleSelectVisible}>
            <img src="/img/x.png" className="playlist-selection__close-icon button"></img>
          </button>
          <h2 className="playlist-selection__title modal-title">プレイリスト選択</h2>
          <button
            className="playlist-selection__create-button playlist-create-button"
            onClick={() => {
              toggleCreateVisible();
              toggleSelectVisible();
            }}
          >
            ＋ 新しいプレイリスト作成
          </button>

          {showSkeleton && <PlaylistSelectSkeleton />}
          <ul className={`playlist-selection__list ${showSkeleton ? "" : "fade-in-up"}`}>
            {playlists.map((playlist, i) => {
              const isSingleImage = playlist.albumImages.length <= 3;
              const firstTrackIsFallbackImage = playlist.trackCount === 0 || (isSingleImage && playlist.albumImages[0] === FALLBACK_COVER_IMAGE);

              return (
                <li
                  key={playlist.id}
                  className="playlist-selection__item"
                  onClick={() => {
                    addTrackToPlaylist(playlist.id);
                  }}
                >
                  <div className={`playlist-selection__item-cover-wrapper `}>
                    <PlaylistCoverImageGrid
                      images={playlist.albumImages}
                      wrapperClassName="playlist-selection__item-cover-img-wrapper"
                      fallbackImgClassName="playlist-selection__coverfallback-img"
                      imgClassName="playlist-selection__item-cover-img"
                    />

                    <div className="playlist-selection__item-initial-cover-img-bg">
                      <img
                        src={FALLBACK_COVER_IMAGE}
                        className="playlist-selection__item-initial-cover-img playlist-initial-cover-img"
                        style={{ display: firstTrackIsFallbackImage ? "block" : "none" }}
                      />
                    </div>
                  </div>
                  <p className="playlist-selection__item-name">{playlist.name}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlaylistSelection;
