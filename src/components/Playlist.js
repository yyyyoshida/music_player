import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaylistContext } from './PlaylistContext';
import usePlaylists from '../hooks/useFetchPlaylists';

const Playlist = () => {
  const { toggleCreateVisible, formatTimeHours } = useContext(PlaylistContext);
  const { playlists, loading } = usePlaylists();

  const navigate = useNavigate();

  function handlePlaylistClick(playlistId) {
    navigate(`/playlist-detail/${playlistId}`);
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading__content">
          <p className="loading__text">読み込み中</p>
          <div className="loading__spinner loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="playlists-page">
      <h2 className="playlists-page__title">プレイリスト</h2>

      <button className="playlists-page__create-button playlist-create-button" onClick={toggleCreateVisible}>
        ＋ 新規プレイリスト作成
      </button>
      <ul className="playlists-page__list">
        {playlists.map((playlist) => (
          <li
            key={playlist.id}
            className="playlists-page__item"
            onClick={() => {
              handlePlaylistClick(playlist.id);
            }}
          >
            <div className="playlists-page__item-cover-img-wrapper">
              {[...playlist.albumImages].slice().map((src, i) => (
                <img key={i} src={src} className={`playlists-page__item-cover-img img-${i}`} />
              ))}

              <img
                src="img/playlist-icon1.png"
                className="playlists-page__item-initial-cover-img playlist-initial-cover-img"
                style={{ visibility: playlist.trackCount === 0 ? 'visible' : 'hidden' }}
              ></img>
            </div>
            <div className="playlists-page__item-info">
              <p className="playlists-page__item-name">{playlist.name}</p>
              <span className="playlists-page__item-count">{`${playlist.trackCount}曲`}</span>
              <span className="playlists-page__item-hours">{`再生時間：${formatTimeHours(playlist.totalDuration)}`}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Playlist;
