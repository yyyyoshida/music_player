import React, { useState, useEffect, useRef, useContext } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams } from 'react-router-dom';
import { PlaylistContext } from './PlaylistContext';
import { PlaylistSuccessMessageContext } from '../contexts/PlaylistSuccessMessageContext';

const RenamePlaylist = ({ isRenameVisible, toggleRenameVisible, tracks }) => {
  const RenameRef = useRef('');
  const { id } = useParams();
  const { playlistName, setPlaylistName } = useContext(PlaylistContext);
  const { toggleisSongAdded } = useContext(PlaylistSuccessMessageContext);

  useEffect(() => {
    const playlistRef = doc(db, 'playlists', id);

    const unsubscribe = onSnapshot(playlistRef, (docSnap) => {
      if (docSnap.exists()) {
        setPlaylistName(docSnap.data().name); // プレイリスト名の更新
      }
    });

    // コンポーネントがアンマウントされた時に監視を解除
    return () => unsubscribe();
  }, [id]);

  function handleSaveRename() {
    const newName = RenameRef.current.value.trim();
    if (!newName) return;

    const playlistRef = doc(db, 'playlists', id);

    updateDoc(playlistRef, { name: newName })
      .then(() => {
        // console.log('プレイリスト名を更新したよ');
        toggleisSongAdded('rename');
        setPlaylistName(newName);
        toggleRenameVisible();
      })
      .catch((error) => {
        console.error('更新失敗:', error);
      });
  }

  useEffect(() => {
    RenameRef.current.value = playlistName;
    RenameRef.current.select();
  }, [isRenameVisible, playlistName]);

  useEffect(() => {
    console.log(playlistName);
  }, [playlistName]);

  return (
    <div className="rename-playlist-modal modal" style={{ visibility: isRenameVisible ? 'visible' : 'hidden' }}>
      <div className="rename-playlist-modal__smoke modal-smoke">
        <div className="rename-playlist-modal__content modal-content">
          <h2 className="rename-playlist-modal__title modal-title">プレイリストの名を変更</h2>
          <div className="rename-playlist-modal__cover-img-wrapper modal-cover-img-wrapper">
            {tracks.length > 0 ? (
              [...tracks]
                .reverse()
                .slice(0, 4)
                .map((track, i) => (
                  <img
                    key={i}
                    src={track.albumImage}
                    alt={`track-${i}`}
                    className={`playlist-detail__header-cover-img img-${i} modal-cover-img`}
                  />
                ))
            ) : (
              <img src="/img/playlist-icon1.png" alt="初期カバー" className="rename-playlist-modal__initial-cover-img" />
            )}
          </div>
          <div className="rename-playlist-modal__field modal-field">
            <label className="rename-playlist-modal__label modal-label" htmlFor="title">
              プレイリスト名を入力
            </label>
            <input className="rename-playlist-modal__input modal-input" id="title" ref={RenameRef} />
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
