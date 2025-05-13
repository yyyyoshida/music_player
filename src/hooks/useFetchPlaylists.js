import { useState, useEffect, useContext } from "react";
import { collection, onSnapshot, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { LoadingContext } from "../contexts/LoadingContext";

const useFetchPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading] = useState(true);
  const { startLoading, stopLoading } = useContext(LoadingContext);

  useEffect(() => {
    console.log("playlistsカスタムフック発火");

    const playlistsQuery = query(collection(db, "playlists"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(playlistsQuery, async (snapshot) => {
      startLoading();

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

      setPlaylists(playlistsData);
      stopLoading();
    });

    return () => unsubscribe(); // コンポーネントがアンマウントされた時にリスナーを解除
  }, []);

  return { playlists, loading };
};

export default useFetchPlaylists;
