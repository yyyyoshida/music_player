import { FALLBACK_COVER_IMAGE } from "../../assets/icons";

const DeletePlaylistModal = ({ isDeleteVisible, toggleDeleteVisible, tracks, deletePlaylist, id }) => {
  return (
    <div className="delete-playlist-modal modal" style={{ visibility: isDeleteVisible ? "visible" : "hidden" }}>
      <div className="delete-playlist-modal__smoke modal-smoke">
        <div className="delete-playlist-modal__content modal-content">
          <h2 className="delete-playlist-modal__title modal-title">本当にこのプレイリストを削除しますか？</h2>
          <div className="delete-playlist-modal__cover-img-wrapper modal-cover-img-wrapper">
            {tracks.length > 0 ? (
              [...tracks]
                .reverse()
                .slice(0, 4)
                .map((track, i) => (
                  <img key={i} src={track.albumImage} alt={`track-${i}`} className={`playlist-detail__header-cover-img img-${i} modal-cover-img`} />
                ))
            ) : (
              <img src={FALLBACK_COVER_IMAGE} alt="初期カバー" className="rename-playlist-modal__initial-cover-img" />
            )}
          </div>

          <div className="delete-playlist-modal__actions modal-actions">
            <button className="delete-playlist-modal__cancel modal-cancel-submit-button modal-cancel-button" onClick={toggleDeleteVisible}>
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
