import { useContext, useRef } from "react";
import { PlaylistContext } from "../contexts/PlaylistContext";
import { warningIcon } from "../assets/icons";

const CreatePlaylist = () => {
  const { isShaking, errorMessage, toggleCreateVisible, handleCreatePlaylist, isCreateVisible, playlistNameRef } = useContext(PlaylistContext);

  return (
    <div className="playlist-page__create-playlist-modal modal" style={{ visibility: isCreateVisible ? "visible" : "hidden" }}>
      <div className="playlist-page__create-playlist-modal-smoke modal-smoke">
        <div className="playlist-page__create-playlist-modal-content modal-content">
          <h2 className="playlist-page__create-playlist-modal-title modal-title">新しいプレイリスト</h2>
          <div className="playlist-page__create-playlist-modal-cover-img-wrapper modal-cover-img-wrapper">
            <img className="playlist-page__create-playlist-modal-initial-cover-img" src="/img/playlist-icon1.png"></img>
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
            <button className="playlist-page__create-playlist-modal-cancel modal-cancel-submit-button modal-cancel-button" onClick={toggleCreateVisible}>
              キャンセル
            </button>
            <button className="playlist-page__create-playlist-modal-create modal-cancel-submit-button modal-submit-button" onClick={handleCreatePlaylist}>
              作成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylist;
