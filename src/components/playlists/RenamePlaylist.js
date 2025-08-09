import { useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { PlaylistContext } from "../../contexts/PlaylistContext";
import { ActionSuccessMessageContext } from "../../contexts/ActionSuccessMessageContext";
import { warningIcon } from "../../assets/icons";
import PlaylistCoverImageGrid from "./PlaylistCoverImageGrid";

const RenamePlaylist = ({ isRenameVisible, setIsRenameVisible, tracks }) => {
  const RenameRef = useRef("");
  const { id } = useParams();
  const { playlistName, setPlaylistName, errorMessage, setErrorMessage, MAX_NAME_LENGTH, countNameLength, isShaking, triggerError } =
    useContext(PlaylistContext);
  const { showMessage } = useContext(ActionSuccessMessageContext);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  function toggleRenameVisible() {
    setErrorMessage("");
    setIsRenameVisible((prev) => !prev);
  }

  async function handleSaveRename() {
    let shouldToggle = true;
    const newName = RenameRef.current.value.trim();
    const nameLength = countNameLength(newName);

    if (!newName) {
      triggerError("名前を入力してください");

      return;
    }

    if (!newName || newName === playlistName) {
      triggerError("名前が同じです。違う名前にしてください");
      return;
    }

    if (nameLength > MAX_NAME_LENGTH) {
      triggerError("文字数オーバーです");

      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/playlists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName, beforeName: playlistName }),
      });

      if (!response.ok) {
        shouldToggle = false;
        const data = await response.json();
        triggerError(data.error);
        return;
      }

      showMessage("rename");
      setPlaylistName(newName);
    } catch (error) {
      console.error("プレイリスト名変更エラー:", error);
      showMessage("renameFailed");
    } finally {
      if (shouldToggle) toggleRenameVisible();
    }
  }

  useEffect(() => {
    RenameRef.current.value = playlistName;
    RenameRef.current.select();
  }, [isRenameVisible, playlistName]);

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
