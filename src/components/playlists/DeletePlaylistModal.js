import { useContext } from "react";
import PlaylistCoverImageGrid from "./PlaylistCoverImageGrid";
import { PlaylistContext } from "../../contexts/PlaylistContext";
import usePlaylistStore from "../../store/playlistStore";

const DeletePlaylistModal = ({ tracks, deletePlaylist, id }) => {
  const isDeleteVisible = usePlaylistStore((state) => state.isDeleteVisible);
  const { hideDeletePlaylistModal } = useContext(PlaylistContext);

  return (
    <div className="delete-playlist-modal modal" style={{ visibility: isDeleteVisible ? "visible" : "hidden" }}>
      <div className="delete-playlist-modal__smoke modal-smoke">
        <div className="delete-playlist-modal__content modal-content">
          <h2 className="delete-playlist-modal__title modal-title">本当にこのプレイリストを削除しますか？</h2>

          <PlaylistCoverImageGrid
            images={tracks.map((track) => track.albumImage)}
            wrapperClassName={`rename-playlist-modal__cover-img-wrapper modal-cover-img-wrapper ${tracks.length <= 3 ? "single" : ""}`}
            fallbackImgWrapperClassName="playlist-cover-fallback-wrapper"
            fallbackImgClassName="playlist-cover-fallback "
            imgClassName="rename-playlist-modal__cover"
          />

          <div className="delete-playlist-modal__actions modal-actions">
            <button className="delete-playlist-modal__cancel modal-cancel-submit-button modal-cancel-button" onClick={hideDeletePlaylistModal}>
              キャンセル
            </button>
            <button
              className="delete-playlist-modal__delete modal-cancel-submit-button modal-submit-button"
              onClick={() => {
                deletePlaylist(id);
              }}
            >
              決定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePlaylistModal;
