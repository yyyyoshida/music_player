import { useEffect, useContext, useRef } from "react";
import { FALLBACK_COVER_IMAGE, warningIcon } from "../../assets/icons";
import usePlaylistStore from "../../store/playlistStore";

import { PlaylistContext } from "../../contexts/PlaylistContext";
import PlaylistSelectionContext from "../../contexts/PlaylistSelectionContext";

const CreatePlaylist = () => {
  const { handleCreatePlaylist } = useContext(PlaylistContext);
  const isCreateVisible = usePlaylistStore((state) => state.isCreateVisible);
  const errorMessage = usePlaylistStore((state) => state.errorMessage);
  const isShaking = usePlaylistStore((state) => state.isShaking);
  const setIsShaking = usePlaylistStore((state) => state.setIsShaking);
  const setPlaylistNameRef = usePlaylistStore((state) => state.setPlaylistNameRef);
  const hideCreatePlaylistModal = usePlaylistStore((state) => state.hideCreatePlaylistModal);
  const { selectedTrack } = useContext(PlaylistSelectionContext);

  const playlistCover = selectedTrack?.albumImage;
  const playlistNameRef = useRef(null);

  const isFallbackCoverImage = !selectedTrack?.albumImage || selectedTrack?.albumImage === "/img/fallback-cover.png";
  const SHAKE_DURATION_MS = 600;

  useEffect(() => {
    setPlaylistNameRef(playlistNameRef);
  }, [playlistNameRef]);

  useEffect(() => {
    if (isCreateVisible && playlistNameRef.current) {
      playlistNameRef.current.focus();
    }
  }, [isCreateVisible]);

  useEffect(() => {
    if (!isShaking) return;

    const timer = setTimeout(() => {
      setIsShaking(false);
    }, SHAKE_DURATION_MS);

    return () => clearTimeout(timer);
  }, [isShaking]);

  return (
    <div className="playlist-page__create-playlist-modal modal" style={{ visibility: isCreateVisible ? "visible" : "hidden" }}>
      <div className="playlist-page__create-playlist-modal-smoke modal-smoke">
        <div className="playlist-page__create-playlist-modal-content modal-content">
          <h2 className="playlist-page__create-playlist-modal-title modal-title">新しいプレイリスト</h2>
          <div className="playlist-page__create-playlist-modal-cover-img-wrapper modal-cover-img-wrapper">
            {isFallbackCoverImage ? (
              <img className="playlist-page__create-playlist-modal-initial-cover-img" src={FALLBACK_COVER_IMAGE} />
            ) : (
              <img className="playlist-page__create-playlist-modal-cover-img" src={playlistCover} />
            )}
          </div>

          <div className="playlist-page__create-playlist-modal-field modal-field">
            <label className="playlist-page__create-playlist-modal-label modal-label" htmlFor="title">
              タイトル
            </label>
            <input
              className="playlist-page__create-playlist-modal-input modal-input"
              id="title"
              ref={playlistNameRef}
              onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
            />

            {errorMessage && (
              <p className={`error-text ${isShaking ? "shake" : ""}`}>
                <img src={warningIcon} />
                {errorMessage}
              </p>
            )}
          </div>
          <div className="playlist-page__create-playlist-modal-actions modal-actions">
            <button
              className="playlist-page__create-playlist-modal-cancel modal-cancel-submit-button modal-cancel-button"
              onClick={hideCreatePlaylistModal}
            >
              キャンセル
            </button>
            <button
              className="playlist-page__create-playlist-modal-create modal-cancel-submit-button modal-submit-button"
              onClick={handleCreatePlaylist}
            >
              作成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylist;
