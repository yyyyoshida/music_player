import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { addDoc, collection, getDocs, increment, serverTimestamp, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { PlaylistContext } from '../components/PlaylistContext';

export const PlaylistSelectionContext = createContext();

export const PlaylistSelectionProvider = ({ children }) => {
  const [isSelectVisible, setIsSelectVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const playlistNameRef = useRef('');

  const { setPlaylists, loading, setLoading } = useContext(PlaylistContext);

  function toggleSelectVisible() {
    setIsSelectVisible((prev) => !prev);
  }

  useEffect(() => {
    const playlistsRef = collection(db, 'playlists');

    // `onSnapshot` を使ってリアルタイムでデータの更新を監視
    const unsubscribe = onSnapshot(playlistsRef, async (snapshot) => {
      setLoading(true); // ローディング開始

      const playlistsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const playlistId = doc.id;
          const tracksSnapshot = await getDocs(collection(db, 'playlists', playlistId, 'tracks'));
          const tracks = tracksSnapshot.docs.map((doc) => doc.data());
          return {
            id: playlistId,
            ...doc.data(),
            trackCount: tracksSnapshot.size || 0, // トラック数
            albumImages: tracks
              .slice()
              .reverse()
              .slice(0, 4)
              .map((track) => track.albumImage), // 最後の4枚のアルバム画像
          };
        })
      );

      setPlaylists(playlistsData);
      setLoading(false); // ローディング終了
    });

    return () => unsubscribe(); // コンポーネントがアンマウントされた時にリスナーを解除
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
        loading,
      }}
    >
      {children}
    </PlaylistSelectionContext.Provider>
  );
};

export default PlaylistSelectionContext;
