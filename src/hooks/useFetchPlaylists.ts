import { useState, useEffect } from "react";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import usePlaylistStore from "../store/playlistStore";
import { API } from "../api/apis";

const useFetchPlaylists = () => {
  const [isPlaylistsLoading, setIsPlaylistsLoading] = useState(true);
  const playlists = usePlaylistStore((state) => state.playlists);
  const setPlaylists = usePlaylistStore((state) => state.setPlaylists);
  const refreshTrigger = usePlaylistStore((state) => state.refreshTrigger);
  const setRefreshTrigger = usePlaylistStore((state) => state.setRefreshTrigger);

  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

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

    if (cachedPlaylists && refreshTrigger === 0) {
      setPlaylists(JSON.parse(cachedPlaylists));
      setIsPlaylistsLoading(false);
      return;
    }

    (async () => {
      try {
        const response = await fetch(API.PLAYLISTS);

        if (!response.ok) {
          fetchPlaylistsFailed(response.status);
          return;
        }

        const data = await response.json();
        setPlaylists(data);
        localStorage.setItem("playlists", JSON.stringify(data));
        setRefreshTrigger(0);
      } catch (error) {
        fetchPlaylistsFailed(error);
      }
    })();
  }, [refreshTrigger]);
  return { playlists, isPlaylistsLoading };
};

export default useFetchPlaylists;
