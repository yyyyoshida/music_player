// usePlaylists.js
import { useState, useEffect } from 'react';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const usePlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('playlistsカスタムフック発火');
    const playlistsRef = collection(db, 'playlists');

    const unsubscribe = onSnapshot(playlistsRef, async (snapshot) => {
      setLoading(true);

      const playlistsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const playlistId = doc.id;
          const tracksSnapshot = await getDocs(collection(db, 'playlists', playlistId, 'tracks'));
          const tracks = tracksSnapshot.docs.map((doc) => doc.data());
          return {
            id: playlistId,
            ...doc.data(),
            trackCount: tracksSnapshot.size || 0,
            albumImages: tracks
              .slice()
              .reverse()
              .slice(0, 4)
              .map((track) => track.albumImage),
          };
        })
      );

      setPlaylists(playlistsData);
      setLoading(false);
    });

    return () => unsubscribe(); // コンポーネントがアンマウントされた時にリスナーを解除
  }, []);

  return { playlists, loading };
};

export default usePlaylists;
