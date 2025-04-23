import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { addDoc, collection, getDocs, increment, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { PlaylistContext } from '../components/PlaylistContext';

export const PlaylistSelectionContext = createContext();

export const PlaylistSelectionProvider = ({ children }) => {
  // const [isSelectVisible, setIsSelectVisible] = useState(true);
  const [isSelectVisible, setIsSelectVisible] = useState(false);
  const playlistNameRef = useRef('');

  const { toggleCreateVisible, playlists, setPlaylists } = useContext(PlaylistContext);

  const [selectedTrack, setSelectedTrack] = useState(null);

  function toggleSelectVisible() {
    setIsSelectVisible((prev) => !prev);
  }

  useEffect(() => {
    const fetchPlaylistsWithTrackCount = async () => {
      const querySnapshot = await getDocs(collection(db, 'playlists'));
      const playlists = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const playlistId = doc.id;
          const tracksSnapshot = await getDocs(collection(db, 'playlists', playlistId, 'tracks'));
          const tracks = tracksSnapshot.docs.map((doc) => doc.data());
          return {
            id: playlistId,
            ...doc.data(),
            trackCount: tracksSnapshot.size || 0, // ← 念のため保険かけとく
            albumImages: tracks
              .slice()
              .reverse()
              .slice(0, 4)
              .map((track) => track.albumImage),
          };
        })
      );
      setPlaylists(playlists);
    };

    fetchPlaylistsWithTrackCount();
  }, []);

  const addTrackToPlaylist = async (playlistId) => {
    if (!selectedTrack) return;

    try {
      await addDoc(collection(db, 'playlists', playlistId, 'tracks'), {
        ...selectedTrack,
        addedAt: serverTimestamp(),
      });
      console.log('✅ 曲追加成功');

      await updateDoc(doc(db, 'playlists', playlistId), {
        totalDuration: increment(selectedTrack.duration),
      });

      toggleSelectVisible();
    } catch (error) {
      console.error('💥 曲追加失敗', error);
    }
  };

  function handleTrackSelect(track, type) {
    if (type === 'searchResults') {
      setSelectedTrack({
        trackId: track.id,
        trackUri: track.uri,
        albumImage: track.album.images[1]?.url,
        title: track.name,
        artist: track.artists[0]?.name,
        duration: track.duration_ms,
      });
    } else if (type === 'firebase') {
      setSelectedTrack({
        trackId: track.trackId,
        trackUri: track.trackUri,
        albumImage: track.albumImage,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
      });
      // } else if (type === 'recentTrack') {
    } else {
      setSelectedTrack({
        trackId: track.track.id,
        trackUri: track.track.uri,
        albumImage: track.track.album.images[1].url,
        title: track.track.name,
        artist: track.track.artists[0].name,
        duration: track.track.duration_ms,
      });
    }

    toggleSelectVisible();
  }

  return (
    <PlaylistSelectionContext.Provider
      value={{
        toggleSelectVisible,
        isSelectVisible,
        setIsSelectVisible,
        playlistNameRef,
        addTrackToPlaylist,
        setSelectedTrack,
        handleTrackSelect,
      }}
    >
      {children}
    </PlaylistSelectionContext.Provider>
  );
};

export default PlaylistSelectionContext;
