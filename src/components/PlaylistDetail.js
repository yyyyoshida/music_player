import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { playIcon, pauseIcon } from '../assets/icons';
import TrackListHead from './TrackListHead';
import { usePlayerContext } from './PlayerContext';
import { SearchContext } from './SearchContext';
import { PlaylistSelectionContext } from './PlaylistSelectionContext';

const PlaylistDetail = () => {
  const { id } = useParams();
  const [tracks, setTracks] = useState([]);
  const { playerTrack, formatTime, isStreaming, trackId } = usePlayerContext();
  const { searchResults, setIsTrackSet } = useContext(SearchContext);
  const { handleFirebaseTrackSelect } = useContext(PlaylistSelectionContext);
  // const trackOfId = trackId;

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const tracksRef = collection(db, 'playlists', id, 'tracks');
        const trackSnapshot = await getDocs(tracksRef);
        const trackList = trackSnapshot.docs.map((doc) => doc.data());
        setTracks(trackList);
      } catch (error) {
        console.error('曲の取得に失敗したよ〜😭', error);
      }
    };

    fetchTracks();
  }, [id]);

  return (
    <div className="playlist-detail">
      {/*  */}
      <div className="playlist-detail__header">
        <img className="playlist-detail__header-cover-img" src="/img/テストサムネ２.jpg" />
        <div className="playlist-detail__header-info">
          <h2 className="playlist-detail__header-title">作業用BGM</h2>
          <p className="playlist-detail__header-status">557曲、34時間24分</p>
        </div>

        <div className="playlist-detail__header-actions-buttons">
          <button className="playlist-detail__header-play-button playlist-detail__header-button">
            <img src={playIcon} className="playlist-detail__header-play-button-icon playlist-detail__header-button-icon" />
            順に再生
          </button>
          <button className="playlist-detail__header-rename-button playlist-detail__header-button">
            <img src="/img/rename.png" className="playlist-detail__header-rename-button-icon playlist-detail__header-button-icon" />
            名前を変更
          </button>
          <button className="playlist-detail__header-delete-button playlist-detail__header-button">
            <img src="/img/delete.png" className="playlist-detail__header-delete-button-icon playlist-detail__header-button-icon" />
            削除
          </button>
        </div>
      </div>

      <TrackListHead />

      {/* <div className="playlist-detail__list-head">
        <div className="playlist-detail__list-head-index">#</div>
        <p className="playlist-detail__list-head-title">タイトル</p>
        <img className="playlist-detail__list-head-time-icon" src="img/clock.png"></img>
      </div> */}

      <ul className="playlist-detail__list">
        {tracks.map((track, index) => {
          const isCurrentTrack = trackId === track.trackId;
          const isTrackPlaying = isCurrentTrack && isStreaming;
          const isClicked = isCurrentTrack;
          return (
            <li
              key={index}
              className={`search-result__item ${isTrackPlaying ? 'playing' : ''} ${isClicked ? 'clicked' : ''}`}
              onClick={() => {
                playerTrack(track.trackUri, isClicked);
                setIsTrackSet(true);
              }}
            >
              <div className="search-result__left">
                <button className="search-result__left-play-pause-button">
                  <img src={isTrackPlaying ? pauseIcon : playIcon} className="search-result__left-play-pause-icon"></img>
                </button>
                <div className={`equalizer ${isTrackPlaying ? '' : 'hidden'}`}>
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                </div>
              </div>
              <img src={track.albumImage} alt={track.title} className="search-result__cover-art" width="50" />
              <div className="search-result__track-info">
                <p className="search-result__title">{track.title}</p>
                <p className="search-result__artist">{track.artist}</p>
              </div>
              <div className="search-result__right">
                <button
                  className="search-result__add-button track-add-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFirebaseTrackSelect(track);
                  }}
                >
                  <img className="search-result__add-icon track-add-icon" src="/img/plus.png" />
                </button>
                <div className="search-result__track-duration">{formatTime(track.duration)}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PlaylistDetail;
