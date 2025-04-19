import React, { useEffect, useState, useRef, useContext } from 'react';
import { PlaylistSelectionContext } from './PlaylistSelectionContext';
import { PlaylistContext } from '../components/PlaylistContext';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const PlaylistSelection = () => {
  const { isSelectVisible, toggleSelectVisible, addTrackToPlaylist } = useContext(PlaylistSelectionContext);

  const { toggleCreateVisible, playlists, setPlaylists } = useContext(PlaylistContext);

  return (
    <div className="playlist-selection" style={{ visibility: isSelectVisible ? 'visible' : 'hidden' }}>
      <div className="playlist-selection__smoke">
        <div className="playlist-selection__content">
          <button className="playlist-selection__close-button" onClick={toggleSelectVisible}>
            <img src="img/x.png" className="playlist-selection__close-icon button"></img>
          </button>
          <h2 className="playlist-selection__title">プレイリスト選択</h2>
          <button
            className="playlist-selection__create-button playlist-create-button"
            onClick={() => {
              toggleCreateVisible();
              toggleSelectVisible();
            }}
          >
            ＋ 新しいプレイリスト作成
          </button>
          <ul className="playlist-selection__list">
            {playlists.map((playlist) => (
              <li
                key={playlist.id}
                className="playlist-selection__item"
                onClick={() => {
                  addTrackToPlaylist(playlist.id);
                }}
              >
                <img src="img/テストサムネ１.jpg" className="playlist-selection__item-cover-art"></img>
                <p className="playlist-selection__item-name">{playlist.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlaylistSelection;
