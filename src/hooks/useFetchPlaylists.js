import { useState, useEffect } from "react";
import { collection, onSnapshot, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const useFetchPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    console.log("playlistsカスタムフック発火");

    const playlistsQuery = query(collection(db, "playlists"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(playlistsQuery, async (snapshot) => {
      const playlistsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const playlistId = doc.id;

          const tracksSnapshot = await getDocs(collection(db, "playlists", playlistId, "tracks"));

          const tracks = tracksSnapshot.docs.map((doc) => doc.data());

          return {
            id: playlistId,
            ...doc.data(),
            trackCount: tracksSnapshot.size || 0,
            albumImages: tracks
              .slice()
              .sort((a, b) => a.addedAt?.seconds - b.addedAt?.seconds)
              .slice(0, 4)
              .map((track) => track.albumImage),
          };
        })
      );

      // setPlaylists(playlistsData);
      if (JSON.stringify(playlistsData) !== JSON.stringify(playlists)) {
        setPlaylists(playlistsData);
      }
    });

    return () => unsubscribe(); // コンポーネントがアンマウントされた時にリスナーを解除
  }, []);

  return { playlists };
};

export default useFetchPlaylists;
