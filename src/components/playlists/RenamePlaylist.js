import { useRef } from "react";
import usePlaylistStore from "../../store/playlistStore";
import { warningIcon } from "../../assets/icons";
import PlaylistCoverImageGrid from "./PlaylistCoverImageGrid";
import useRenamePlaylist from "../../hooks/useRenamePlaylist";

const RenamePlaylist = ({ isRenameVisible, setIsRenameVisible, tracks }) => {
  const errorMessage = usePlaylistStore((state) => state.errorMessage);
  const isShaking = usePlaylistStore((state) => state.isShaking);
  const countNameLength = usePlaylistStore((state) => state.countNameLength);
  const MAX_NAME_LENGTH = usePlaylistStore((state) => state.MAX_NAME_LENGTH);

  const RenameRef = useRef("");
  const { handleSaveRename, toggleRenameVisible } = useRenamePlaylist(setIsRenameVisible, RenameRef, validatePlaylistName, isRenameVisible);

  function validatePlaylistName(newName, beforeName) {
    if (typeof newName !== "string") {
      return "名前は文字列である必要があります";
    }

    if (!newName) {
      return "名前を入力してください";
    }

    if (newName === beforeName) {
      return "名前が同じです。違う名前にしてください";
    }

    if (countNameLength(newName) > MAX_NAME_LENGTH) {
      return "文字数オーバーです";
    }

    return null;
  }

  return (
    <div className="rename-playlist-modal modal" style={{ visibility: isRenameVisible ? "visible" : "hidden" }}>
      <div className="rename-playlist-modal__smoke modal-smoke">
        <div className="rename-playlist-modal__content modal-content">
          <h2 className="rename-playlist-modal__title modal-title">プレイリストの名を変更</h2>

          <PlaylistCoverImageGrid
            images={tracks.map((track) => track.albumImage)}
            wrapperClassName={`rename-playlist-modal__cover-img-wrapper modal-cover-img-wrapper ${tracks.length <= 3 ? "single" : ""}`}
            fallbackImgWrapperClassName="playlist-cover-fallback-wrapper"
            fallbackImgClassName="playlist-cover-fallback "
            imgClassName="rename-playlist-modal__cover"
          />

          <div className="rename-playlist-modal__field modal-field">
            <label className="rename-playlist-modal__label modal-label" htmlFor="title">
              プレイリスト名を入力
            </label>
            <input
              className="rename-playlist-modal__input modal-input"
              id="title"
              ref={RenameRef}
              onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
            />

            {errorMessage && (
              <p className={`error-text ${isShaking ? "shake" : ""}`}>
                <img src={warningIcon} />
                {errorMessage}
              </p>
            )}
          </div>
          <div className="rename-playlist-modal__actions modal-actions">
            <button className="rename-playlist-modal__cancel modal-cancel-submit-button modal-cancel-button" onClick={toggleRenameVisible}>
              キャンセル
            </button>
            <button
              className="rename-playlist-modal__create modal-cancel-submit-button modal-submit-button"
              onClick={() => {
                handleSaveRename();
              }}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenamePlaylist;
