import React, { useContext, useRef, useEffect } from "react";
import { PlaylistSelectionContext } from "./PlaylistSelectionContext";
import { PlaylistContext } from "../components/PlaylistContext";
import useFetchPlaylists from "../hooks/useFetchPlaylists";
import { LoadingContext } from "../contexts/LoadingContext";

const PlaylistSelection = () => {
  const { isSelectVisible, toggleSelectVisible, addTrackToPlaylist } = useContext(PlaylistSelectionContext);
  const { toggleCreateVisible } = useContext(PlaylistContext);
  const { playlists } = useFetchPlaylists();
  const { isLoading } = useContext(LoadingContext);

  const coverImagesRefs = useRef([]);

  const FADE_DURATION = 300;

  useEffect(() => {
    const timeoutIds = [];

    coverImagesRefs.current.forEach((element) => {
      if (element) {
        element.style.opacity = "0";

        const timeoutId = setTimeout(() => {
          element.style.opacity = "1";
        }, FADE_DURATION);

        timeoutIds.push(timeoutId);
      }
    });

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [playlists]);

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

          {isLoading && !isSelectVisible ? (
            // {/* {isLoading ? ( */}
            <div className="loading mini-loading">
              <div className="loading__content mini-loading-content">
                <p className="loading__text mini-loading-text">読み込み中</p>
                <div className="loading__spinner mini-loading-loading-spinner loader"></div>
              </div>
            </div>
          ) : (
            <ul className="playlist-selection__list">
              {playlists.map((playlist, i) => {
                const isSingleImage = playlist.albumImages.length <= 3;
                return (
                  <li
                    key={playlist.id}
                    className="playlist-selection__item"
                    onClick={() => {
                      addTrackToPlaylist(playlist.id);
                    }}
                  >
                    <div className="playlist-selection__item-cover-img-wrapper">
                      <div className={`playlist-selection__item-cover-imgs ${isSingleImage && "single"}`} ref={(el) => (coverImagesRefs.current[i] = el)}>
                        {playlist.albumImages.map((src, i) => (
                          <img key={i} src={src} className={`playlist-selection__item-cover-img img-${i}`} />
                        ))}
                      </div>
                      <div className="playlist-selection__item-initial-cover-img-bg">
                        <img
                          src="/img/playlist-icon1.png"
                          className="playlist-selection__item-initial-cover-img playlist-initial-cover-img"
                          // style={{ display: playlist.albumImages.length === 0 ? "block" : "none" }}
                        />
                      </div>
                    </div>
                    <p className="playlist-selection__item-name">{playlist.name}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistSelection;
