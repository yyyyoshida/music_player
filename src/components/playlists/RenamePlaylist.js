import { useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { PlaylistContext } from "../../contexts/PlaylistContext";
import usePlaylistStore from "../../store/playlistStore";
import useActionSuccessMessageStore from "../../store/actionSuccessMessageStore";
import { warningIcon } from "../../assets/icons";
import PlaylistCoverImageGrid from "./PlaylistCoverImageGrid";

const RenamePlaylist = ({ isRenameVisible, setIsRenameVisible, tracks }) => {
  const RenameRef = useRef("");
  const { id } = useParams();
  const { MAX_NAME_LENGTH, countNameLength, triggerError } = useContext(PlaylistContext);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

  const setPlaylists = usePlaylistStore((state) => state.setPlaylists);
  const errorMessage = usePlaylistStore((state) => state.errorMessage);
  const setErrorMessage = usePlaylistStore((state) => state.setErrorMessage);
  const playlistInfo = usePlaylistStore((state) => state.playlistInfo);
  const setPlaylistInfo = usePlaylistStore((state) => state.setPlaylistInfo);
  const isShaking = usePlaylistStore((state) => state.isShaking);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const cachedPlaylistInfo = localStorage.getItem(`playlistDetail:${id}Info`);
  const playlistInfoData = cachedPlaylistInfo ? JSON.parse(cachedPlaylistInfo) : null;

  function toggleRenameVisible() {
    setErrorMessage("");
    setIsRenameVisible((prev) => !prev);
  }

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

  async function handleSaveRename() {
    let shouldToggle = true;
    const playlistName = playlistInfo?.name;
    const newName = RenameRef.current.value.trim();
    const validationError = validatePlaylistName(newName, playlistName);

    if (validationError) {
      return triggerError(validationError);
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

      const updatedInfoData = { ...playlistInfoData, name: newName };
      const cachedPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
      const updatedPlaylists = cachedPlaylists.map((playlist) => (playlist.id === id ? { ...playlist, name: newName } : playlist));

      setPlaylistInfo(updatedInfoData);
      setPlaylists(updatedPlaylists);

      localStorage.setItem(`playlistDetail:${id}Info`, JSON.stringify(updatedInfoData));
      localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    } catch (error) {
      console.error("プレイリスト名変更エラー:", error);
      showMessage("renameFailed");
    } finally {
      if (shouldToggle) toggleRenameVisible();
    }
  }

  useEffect(() => {
    RenameRef.current.value = playlistInfo.name;
    RenameRef.current.select();
  }, [isRenameVisible, playlistInfo]);

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
