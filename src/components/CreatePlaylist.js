import React, { useContext, useRef } from 'react';
import { PlaylistContext } from './PlaylistContext';

const CreatePlaylist = () => {
  const { toggleCreateVisible, handleCreatePlaylist, isCreateVisible, playlistNameRef } = useContext(PlaylistContext);

  return (
    <div className="playlist-page__create-playlist-modal" style={{ visibility: isCreateVisible ? 'visible' : 'hidden' }}>
      <div className="playlist-page__create-playlist-modal-smoke">
        <div className="playlist-page__create-playlist-modal-card">
          <h2 className="playlist-page__create-playlist-modal-title">新しいプレイリスト</h2>
          <div className="playlist-page__create-playlist-modal-field">
            <label className="playlist-page__create-playlist-modal-label" htmlFor="title">
              タイトル
            </label>
            <input className="playlist-page__create-playlist-modal-input" id="title" ref={playlistNameRef} />
          </div>
          <div className="playlist-page__create-playlist-modal-actions">
            <button className="playlist-page__create-playlist-modal-cancel playlist-button" onClick={toggleCreateVisible}>
              キャンセル
            </button>
            <button className="playlist-page__create-playlist-modal-create playlist-button" onClick={handleCreatePlaylist}>
              作成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylist;
