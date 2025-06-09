import { useContext } from "react";
import UploadModalContext from "../contexts/UploadModalContext";
import PlaylistContext from "../contexts/PlaylistContext";

const UploadStatusModal = () => {
  const { isVisible, hideUploadModal } = useContext(UploadModalContext);
  const { preselectedTrack } = useContext(PlaylistContext);

  return (
    <div className="upload-modal modal" style={{ visibility: isVisible ? "visible" : "hidden" }}>
      <div className=" modal-smoke">
        <div className="upload-modal__content modal-content">
          <h2 className="modal-title">曲をアップロードしています. . .</h2>
          <div className="upload-modal__track">
            <div className="upload-modal__track-cover-img-wrapper">
              <img src={preselectedTrack?.albumImage} className="upload-modal__track-cover-img" alt="アップロード中の曲のカバー画像" />
            </div>
            <div className="upload-modal__track-info">
              <p className="upload-modal__track-title">{preselectedTrack?.title ?? "タイトル不明"}</p>
              <p className="upload-modal__track-artist">{preselectedTrack?.artist ?? "アーティスト不明"}</p>
            </div>
            <div className={`loader ${isVisible ? "animate" : ""}`}></div>
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
