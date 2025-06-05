import { useEffect, useRef, useContext } from "react";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router-dom";
import { PlaylistContext } from "../../contexts/PlaylistContext";
import { ActionSuccessMessageContext } from "../../contexts/ActionSuccessMessageContext";
import { warningIcon, FALLBACK_COVER_IMAGE } from "../../assets/icons";

const RenamePlaylist = ({ isRenameVisible, setIsRenameVisible, tracks }) => {
  const RenameRef = useRef("");
  const { id } = useParams();
  const { playlistName, setPlaylistName, errorMessage, setErrorMessage, MAX_NAME_LENGTH, countNameLength, isShaking, triggerError } =
    useContext(PlaylistContext);
  const { showMessage } = useContext(ActionSuccessMessageContext);

  const isUsedFallbackImage = tracks.length <= 3 && tracks[0]?.albumImage === FALLBACK_COVER_IMAGE;
  useEffect(() => {
    const playlistRef = doc(db, "playlists", id);

    const unsubscribe = onSnapshot(playlistRef, (docSnap) => {
      if (docSnap.exists()) {
        setPlaylistName(docSnap.data().name); // プレイリスト名の更新
      }
    });

    // コンポーネントがアンマウントされた時に監視を解除
    return () => unsubscribe();
  }, [id]);

  function toggleRenameVisible() {
    setErrorMessage("");
    setIsRenameVisible((prev) => !prev);
  }

  function handleSaveRename() {
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

    const playlistRef = doc(db, "playlists", id);

    updateDoc(playlistRef, { name: newName })
      .then(() => {
        showMessage("rename");
        setPlaylistName(newName);
        toggleRenameVisible();
      })
      .catch((error) => {
        console.error("更新失敗:", error);
      });
  }

  useEffect(() => {
    RenameRef.current.value = playlistName;
    RenameRef.current.select();
  }, [isRenameVisible, playlistName]);

  function isFallbackImage(index) {
    return tracks[index]?.albumImage === FALLBACK_COVER_IMAGE;
  }

  return (
    <div className="rename-playlist-modal modal" style={{ visibility: isRenameVisible ? "visible" : "hidden" }}>
      <div className="rename-playlist-modal__smoke modal-smoke">
        <div className="rename-playlist-modal__content modal-content">
          <h2 className="rename-playlist-modal__title modal-title">プレイリストの名を変更</h2>

          <div className={`rename-playlist-modal__cover-img-wrapper modal-cover-img-wrapper ${tracks.length <= 3 ? "single" : ""}`}>
            {tracks.length > 0 && !isUsedFallbackImage ? (
              [...tracks].slice(0, tracks.length <= 3 ? 1 : 4).map((track, i) => {
                const isFallback = isFallbackImage(i);
                if (isFallback) {
                  return (
                    <div key={i} className={`playlist-cover-fallback-wrapper track-${i}`}>
                      <img src={track.albumImage} alt={`track-${i}`} className={`playlist-cover-fallback img-${i}`} />
                    </div>
                  );
                } else {
                  return <img key={i} src={track.albumImage} alt={`track-${i}`} className={`img-${i} rename-playlist-modal__cover`} />;
                }
              })
            ) : (
              <img src={FALLBACK_COVER_IMAGE} alt="fallback-cover" className="rename-playlist-modal__initial-cover-img" />
            )}
          </div>

          <div className="rename-playlist-modal__field modal-field">
            <label className="rename-playlist-modal__label modal-label" htmlFor="title">
              プレイリスト名を入力
            </label>
            <input className="rename-playlist-modal__input modal-input" id="title" ref={RenameRef} onKeyDown={(e) => e.key === "Enter" && handleSaveRename()} />

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
