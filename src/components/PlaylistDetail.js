import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { playIcon } from '../assets/icons';
import TrackListHead from './TrackListHead';
import { usePlayerContext } from './PlayerContext';
import { SearchContext } from './SearchContext';
import { PlaylistSelectionContext } from './PlaylistSelectionContext';
import TrackItem from './TrackItem';
import { PlaylistContext } from './PlaylistContext';
import { PlaybackContext } from '../contexts/PlaybackContext';
import RenamePlaylist from './RenamePlaylist';

const PlaylistDetail = () => {
  const { id } = useParams();

  const [tracks, setTracks] = useState([]);
  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [playlistInfo, setPlaylistInfo] = useState({ title: '', duration: 0 });

  const { playerTrack, formatTime, isStreaming, trackId } = usePlayerContext();

  const { setIsTrackSet } = useContext(SearchContext);
  const { handleTrackSelect } = useContext(PlaylistSelectionContext);
  const { formatTimeHours, playlistName, setPlaylistName } = useContext(PlaylistContext);
  const { setQueue, queue, playTrackAt } = useContext(PlaybackContext);

  useEffect(() => {
    const fetchPlaylistInfo = async () => {
      try {
        const docRef = doc(db, 'playlists', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPlaylistInfo(docSnap.data());
        }
      } catch (error) {
        console.error('プレイリスト情報の取得に失敗', error);
      }
    };

    fetchPlaylistInfo();
  }, [id]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const tracksRef = collection(db, 'playlists', id, 'tracks');
        const trackSnapshot = await getDocs(tracksRef);
        const trackList = trackSnapshot.docs.map((doc) => doc.data());
        setTracks(trackList);
      } catch (error) {
        console.error('曲の取得に失敗した', error);
      }
    };

    fetchTracks();
  }, [id]);

  useEffect(() => {
    setQueue(tracks);
    setIsTrackSet(true);
  }, [tracks]);

  function toggleRenameVisible() {
    setIsRenameVisible((prev) => !prev);
  }

  return (
    <div className="playlist-detail">
      <div className="playlist-detail__header">
        <div className="playlist-detail__header-cover-img-wrapper">
          {[...tracks]
            .reverse()
            .slice(0, 4)
            .map((track, i) => (
              <img key={i} src={track.albumImage} alt={`track-${i}`} className={`playlist-detail__header-cover-img img-${i}`} />
            ))}
          <img
            src="/img/playlist-icon1.png"
            className="playlists-detail__header-initial-cover-img playlist-initial-cover-img"
            style={{ visibility: tracks.length === 0 ? 'visible' : 'hidden' }}
          ></img>
        </div>
        <div className="playlist-detail__header-info">
          <h2 className="playlist-detail__header-title">{playlistName}</h2>

          <p className="playlist-detail__header-status"> {`${tracks.length}曲, ${formatTimeHours(playlistInfo.totalDuration)}`}</p>
        </div>

        <div className="playlist-detail__header-actions-buttons">
          <button
            className="playlist-detail__header-play-button playlist-detail__header-button"
            onClick={() => {
              playerTrack(queue[0].trackUri);
              playTrackAt(0);
            }}
          >
            <img src={playIcon} className="playlist-detail__header-play-button-icon playlist-detail__header-button-icon" />
            順に再生
          </button>
          <button className="playlist-detail__header-rename-button playlist-detail__header-button" onClick={toggleRenameVisible}>
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
              key={track.trackId}
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

      <RenamePlaylist isRenameVisible={isRenameVisible} toggleRenameVisible={toggleRenameVisible} tracks={tracks} />
    </div>
  );
};

export default PlaylistDetail;
