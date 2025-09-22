import { useEffect } from "react";
import { useParams } from "react-router-dom";
import usePlaylistStore from "../store/playlistStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import validatePlaylistName from "../utils/validatePlaylistName";

const useRenamePlaylist = (setIsRenameVisible, RenameRef, isRenameVisible) => {
  const triggerError = usePlaylistStore((state) => state.triggerError);
  const setPlaylistInfo = usePlaylistStore((state) => state.setPlaylistInfo);
  const setPlaylists = usePlaylistStore((state) => state.setPlaylists);
  const setErrorMessage = usePlaylistStore((state) => state.setErrorMessage);
  const playlistInfo = usePlaylistStore((state) => state.playlistInfo);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

  const { id } = useParams();
  const cachedPlaylistInfo = localStorage.getItem(`playlistDetail:${id}Info`);
  const playlistInfoData = cachedPlaylistInfo ? JSON.parse(cachedPlaylistInfo) : null;
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  function toggleRenameVisible() {
    setErrorMessage("");
    setIsRenameVisible((prev) => !prev);
  }

  async function handleSaveRename() {
    let shouldToggle = true;

    const playlistName = playlistInfo?.name;
    const newName = RenameRef.current.value.trim();
    const validationError = validatePlaylistName(newName, playlistName);

    if (validationError) {
      return triggerError(validationError);
    }

    try {
      const response = await fetch(`${BASE_URL}/api/playlists/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName, beforeName: playlistName }),
      });

      if (!response.ok) {
        shouldToggle = false;
        const data = await response.json();
        triggerError(data.error);
        return;
      }

      showMessage("rename");

      const updatedInfoData = { ...playlistInfoData, name: newName };
      const cachedPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
      const updatedPlaylists = cachedPlaylists.map((playlist) => (playlist.id === id ? { ...playlist, name: newName } : playlist));

      setPlaylistInfo(updatedInfoData);
      setPlaylists(updatedPlaylists);

      localStorage.setItem(`playlistDetail:${id}Info`, JSON.stringify(updatedInfoData));
      localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    } catch (error) {
      console.error("プレイリスト名変更エラー:", error);
      showMessage("renameFailed");
    } finally {
      if (shouldToggle) toggleRenameVisible();
    }
  }

  useEffect(() => {
    RenameRef.current.value = playlistInfo?.name;
    RenameRef.current.select();
  }, [isRenameVisible, playlistInfo]);
  return {
    handleSaveRename,
    toggleRenameVisible,
  };
};

export default useRenamePlaylist;
