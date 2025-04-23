import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { playIcon, pauseIcon } from '../assets/icons';
import TrackListHead from './TrackListHead';
import { usePlayerContext } from './PlayerContext';
import { SearchContext } from './SearchContext';
import { PlaylistSelectionContext } from './PlaylistSelectionContext';
import TrackItem from './TrackItem';

const PlaylistDetail = () => {
  const { id } = useParams();
  const [tracks, setTracks] = useState([]);
  const { playerTrack, formatTime, isStreaming, trackId } = usePlayerContext();
  const { searchResults, setIsTrackSet } = useContext(SearchContext);
  const { handleTrackSelect } = useContext(PlaylistSelectionContext);

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

      <ul className="playlist-detail__list">
        {tracks.map((track, index) => {
          const isCurrentTrack = trackId === track.trackId;
          const isTrackPlaying = isCurrentTrack && isStreaming;
          const isClicked = isCurrentTrack;

          return (
            <TrackItem
              track={track}
              index={index}
              isCurrentTrack={isCurrentTrack}
              isTrackPlaying={isTrackPlaying}
              isClicked={isClicked}
              setIsTrackSet={setIsTrackSet}
              playerTrack={playerTrack}
              formatTime={formatTime}
              handleTrackSelect={() => handleTrackSelect(track, 'firebase')}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default PlaylistDetail;
