import { useState, useEffect } from "react";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import usePlaylistStore from "../store/playlistStore";

const useFetchPlaylists = () => {
  const [isPlaylistsLoading, setIsPlaylistsLoading] = useState(true);
  const playlists = usePlaylistStore((state) => state.playlists);
  const setPlaylists = usePlaylistStore((state) => state.setPlaylists);

  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  function fetchPlaylistsFailed(logValue: unknown): void {
    console.error("プレイリスト一覧の取得失敗: ", logValue as number | Error);
    localStorage.removeItem("playlists");
    setPlaylists([]);
    showMessage("fetchPlaylistsFailed");
    setIsPlaylistsLoading(false);
  }

  useEffect(() => {
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

        if (!response.ok) {
          fetchPlaylistsFailed(response.status);
          return;
        }

        const data = await response.json();
        setPlaylists(data);
        localStorage.setItem("playlists", JSON.stringify(data));
      } catch (error) {
        fetchPlaylistsFailed(error);
      }
    })();
  }, []);
  return { playlists, isPlaylistsLoading };
};

export default useFetchPlaylists;
