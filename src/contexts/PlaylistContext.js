import { createContext, useState, useContext, useRef, useEffect } from "react";
import { ActionSuccessMessageContext } from "./ActionSuccessMessageContext";
import { useNavigate } from "react-router-dom";
import { clearPlaylistsCache } from "../utils/clearPlaylistCache";

export const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const playlistNameRef = useRef("");
  const [playlistInfo, setPlaylistInfo] = useState({ title: "", duration: 0 });
  const [playlistName, setPlaylistName] = useState(playlistInfo.name);
  const { showMessage } = useContext(ActionSuccessMessageContext);
  const [currentPlaylistId, setCurrentPlaylistId] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [deletedTrackDuration, setDeletedTrackDuration] = useState(0);
  const [addedTrackDuration, setAddedTrackDuration] = useState(0);
  const navigate = useNavigate();
  const MAX_NAME_LENGTH = 10;
  const [errorMessage, setErrorMessage] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [preselectedTrack, setPreselectedTrack] = useState(null);
  const [isCoverImageFading, setIsCoverImageFading] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const SHAKE_DURATION_MS = 600;
  const addSelectedTrackToPlaylistRef = useRef(() => {});

  useEffect(() => {
    setErrorMessage("");
  }, [isCreateVisible]);

  useEffect(() => {
    if (!isShaking) return;

    const timer = setTimeout(() => {
      setIsShaking(false);
    }, SHAKE_DURATION_MS);

    return () => clearTimeout(timer);
  }, [isShaking]);

  function showCreatePlaylistModal() {
    setIsCreateVisible(true);
    playlistNameRef.current.value = "";
  }
  const hideCreatePlaylistModal = () => setIsCreateVisible(false);
  const showDeletePlaylistModal = () => setIsDeleteVisible(true);
  const hideDeletePlaylistModal = () => setIsDeleteVisible(false);

  const fadeCoverImages = () => setIsCoverImageFading(true);

  useEffect(() => {
    let timeoutId;

    if (isCoverImageFading) {
      timeoutId = setTimeout(() => setIsCoverImageFading(false), 400);
    }

    return () => clearTimeout(timeoutId);
  }, [isCoverImageFading]);

  function countNameLength(string) {
    let nameLength = 0;
    for (let i = 0; i < string.length; i++) {
      const code = string.charCodeAt(i);
      nameLength += code <= 0x007f ? 0.5 : 1;
    }
    return nameLength;
  }

  function triggerError(message) {
    setErrorMessage(message);
    setIsShaking(true);
  }

  useEffect(() => {
    if (isCreateVisible && playlistNameRef.current) {
      playlistNameRef.current.focus();
    }
  }, [isCreateVisible]);

  const handleCreatePlaylist = async () => {
    const newName = playlistNameRef.current.value;

    const nameLength = countNameLength(newName.trim());

    if (!newName.trim()) return triggerError("名前を入力してください");

    if (nameLength > MAX_NAME_LENGTH) return triggerError(`文字数オーバーです`);

    try {
      const response = await fetch(`${BASE_URL}/api/playlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        triggerError(data.error);
        return;
      }

      const data = await response.json();
      showMessage("newPlaylist");
      playlistNameRef.current.value = "";
      setPreselectedTrack(null);
      hideCreatePlaylistModal();
    } catch {}
  };

  function formatTimeHours(time) {
    if (!time) return "0分";

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

  async function deleteTrack(trackId) {
    const cachedPlaylistInfo = localStorage.getItem(`playlistDetail:${currentPlaylistId}Info`);
    const playlistInfoData = cachedPlaylistInfo ? JSON.parse(cachedPlaylistInfo) : null;
    const totalDuration = playlistInfoData?.totalDuration;
    try {
      const response = await fetch(`${BASE_URL}/api/playlists/${currentPlaylistId}/tracks/${trackId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("楽曲削除失敗");

      const { deletedTrack } = await response.json();

      setDeletedTrackDuration((prev) => {
        const deletedTrackDuration = prev + deletedTrack.duration_ms;
        const resultTotalDuration = totalDuration - deletedTrackDuration;

        const updatedInfoData = { ...playlistInfoData, totalDuration: resultTotalDuration };
        localStorage.setItem(`playlistDetail:${currentPlaylistId}Info`, JSON.stringify(updatedInfoData));

        return deletedTrackDuration;
      });

      setTracks((prevTracks) => {
        const updatedTracks = prevTracks.filter((track) => track.id !== trackId);
        localStorage.setItem(`playlistDetail:${currentPlaylistId}Tracks`, JSON.stringify(updatedTracks));
        return updatedTracks;
      });

      fadeCoverImages();
      showMessage("deleteTrack");
      clearPlaylistsCache();
    } catch {
      showMessage("deleteTrackFailed");
    }
  }

  async function deletePlaylist(playlistId) {
    try {
      const response = await fetch(`${BASE_URL}/api/playlists/${playlistId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("プレイリスト削除失敗");

      clearPlaylistsCache();
      navigate("/playlist");
      showMessage("deletePlaylist");
    } catch {
      showMessage("deletePlaylistFailed");
    } finally {
      hideDeletePlaylistModal();
    }
  }

  return (
    <PlaylistContext.Provider
      value={{
        handleCreatePlaylist,
        showCreatePlaylistModal,
        hideCreatePlaylistModal,
        isCreateVisible,
        showDeletePlaylistModal,
        hideDeletePlaylistModal,
        isDeleteVisible,

        playlistNameRef,
        formatTimeHours,
        playlistName,
        setPlaylistName,
        playlistInfo,
        setPlaylistInfo,
        deleteTrack,
        deletePlaylist,

        currentPlaylistId,
        setCurrentPlaylistId,

        tracks,
        setTracks,

        deletedTrackDuration,
        setDeletedTrackDuration,
        addedTrackDuration,
        setAddedTrackDuration,

        errorMessage,
        setErrorMessage,
        MAX_NAME_LENGTH,
        countNameLength,
        isShaking,
        triggerError,

        preselectedTrack,
        setPreselectedTrack,

        isCoverImageFading,

        addSelectedTrackToPlaylistRef,
        fadeCoverImages,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export default PlaylistContext;
