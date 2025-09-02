import { useState, useEffect, useContext } from "react";
import PlaylistContext from "../contexts/PlaylistContext";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";

const useFetchPlaylists = () => {
  const [isPlaylistsLoading, setIsPlaylistsLoading] = useState(true);
  const { playlists, setPlaylists } = useContext(PlaylistContext);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

  const FETCH_PLAYLISTS_ERROR_DELAY = 1000;
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    // どうやらuseEffectの中のasyncでクリーンアップ関数はreactに認識されないらしい
    // なので外に宣言するようにした
    let timer;

    setIsPlaylistsLoading(true);
    const cachedPlaylists = localStorage.getItem("playlists");
    if (cachedPlaylists) {
      setPlaylists(JSON.parse(cachedPlaylists));
      setIsPlaylistsLoading(false);
      return;
    }

    (async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/playlists`);

        if (!response.ok) throw new Error("Failed to fetch playlists");

        const data = await response.json();
        setPlaylists(data);
        localStorage.setItem("playlists", JSON.stringify(data));
      } catch {
        timer = setTimeout(() => {
          showMessage("fetchPlaylistsFailed");
        }, FETCH_PLAYLISTS_ERROR_DELAY);
      } finally {
        setIsPlaylistsLoading(false);
      }
    })();
    return () => clearTimeout(timer);
  }, []);
  return { playlists, isPlaylistsLoading };
};

export default useFetchPlaylists;
