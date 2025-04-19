import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
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
    console.log('はろはろ');
    const fetchPlaylists = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'playlists'));
        // const fetchedPlaylists = querySnapshot.docs.map((doc) => ({

        //   id: doc.id,
        //   ...doc.data(),
        // }));
        // console.log(db);
        console.log(querySnapshot);
        const fetchedPlaylists = querySnapshot.docs.map((doc) => {
          console.log('🎵 doc data:', doc.data()); // ←追加
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error('プレイリストの取得失敗', error);
      }
    };
    fetchPlaylists();
  }, []);

  const addTrackToPlaylist = async (playlistId) => {
    if (!selectedTrack) return;

    try {
      await addDoc(collection(db, 'playlists', playlistId, 'tracks'), {
        ...selectedTrack,
        addedAt: serverTimestamp(),
      });
      console.log('✅ 曲追加成功');
      // setSelectedTrack(null);
      toggleSelectVisible();
    } catch (error) {
      console.error('💥 曲追加失敗', error);
    }
  };

  function handleTrackSelect(track) {
    setSelectedTrack({
      trackId: track.id,
      trackUri: track.uri,
      albumImage: track.album.images[2]?.url,
      title: track.name,
      artist: track.artists[0]?.name,
    });
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
