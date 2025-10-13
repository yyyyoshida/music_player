import useUploadModalStore from "../store/uploadModalStore";
import usePlaylistSelectionStore from "../store/playlistSelectionStore";
import { FALLBACK_COVER_IMAGE } from "../assets/icons";
import type { LocalTrack } from "../store/playbackStore";

const UploadStatusModal = () => {
  const selectedTrack = usePlaylistSelectionStore((state) => state.selectedTrack) as LocalTrack;

  const isUploadModalVisible = useUploadModalStore((state) => state.isUploadModalVisible);
  const hideUploadModal = useUploadModalStore((state) => state.hideUploadModal);
  // let trackCoverImage;
  const isUsedFallbackImage = selectedTrack?.albumImage === FALLBACK_COVER_IMAGE;

  return (
    <div className="upload-modal modal" style={{ visibility: isUploadModalVisible ? "visible" : "hidden" }}>
      <div className=" modal-smoke">
        <div className="upload-modal__content modal-content">
          <h2 className="modal-title">曲をアップロードしています. . .</h2>
          <div className="upload-modal__track">
            <div className="upload-modal__track-cover-img-wrapper">
              <img
                src={selectedTrack?.albumImage}
                className={`upload-modal__track-cover-img ${isUsedFallbackImage ? "fallback-cover" : ""}`}
                alt="アップロード中の曲のカバー画像"
              />
            </div>
            <div className="upload-modal__track-info">
              <p className="upload-modal__track-title">{selectedTrack?.title ?? "タイトル不明"}</p>
              <p className="upload-modal__track-artist">{selectedTrack?.artist ?? "アーティスト不明"}</p>
            </div>
            <div className={`loader ${isUploadModalVisible ? "animate" : ""}`}></div>
          </div>
          <button className="upload-modal__exsit-button modal-cancel-submit-button modal-cancel-button" onClick={hideUploadModal}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadStatusModal;
