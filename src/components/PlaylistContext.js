import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([]);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const playlistNameRef = useRef('');

  function toggleCreateVisible() {
    setIsCreateVisible((prev) => !prev);
  }

  const handleCreatePlaylist = async () => {
    if (!playlistNameRef.current.value.trim()) {
      alert('値を入れろゴラァあ！！');
      return;
    }

    try {
      await addDoc(collection(db, 'playlists'), {
        name: playlistNameRef.current.value,
      });

      console.log('プレイリスト作成成功');
      playlistNameRef.current.value = '';

      toggleCreateVisible();
    } catch (error) {
      console.error('作成失敗', error);
    }
  };

  function formatTimeHours(time) {
    const MS_HOUR = 3600000;
    const MS_MINUTE = 60000;

    const hours = Math.floor(time / MS_HOUR);
    const minutes = Math.floor((time % MS_HOUR) / MS_MINUTE);

    if (hours > 0) {
      return `${hours}時間 ${minutes}分`;
    } else {
      return `${minutes}分`;
    }
  }

  return (
    <PlaylistContext.Provider
      value={{
        handleCreatePlaylist,
        toggleCreateVisible,
        isCreateVisible,
        setIsCreateVisible,
        playlistNameRef,
        playlists,
        setPlaylists,
        formatTimeHours,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export default PlaylistContext;
