import { createContext, useState, useContext, useRef, useEffect } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc, increment, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { deleteObject, ref as storageRef } from "firebase/storage";
import { storage } from "../firebase"; // ストレージのインスタンス
import { ActionSuccessMessageContext } from "./ActionSuccessMessageContext";
import { useNavigate } from "react-router-dom";

export const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const playlistNameRef = useRef("");
  const [playlistInfo, setPlaylistInfo] = useState({ title: "", duration: 0 });
  const [playlistName, setPlaylistName] = useState(playlistInfo.name);
  const { showMessage } = useContext(ActionSuccessMessageContext);
  const [playlistId, setPlaylistId] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [deletedTrackDuration, setDeletedTrackDuration] = useState(0);
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const MAX_NAME_LENGTH = 10;
  const [isShaking, setIsShaking] = useState(false);
  const [preselectedTrack, setPreselectedTrack] = useState(null);
  const [isCoverImageFading, setIsCoverImageFading] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    setErrorMessage("");
  }, [isCreateVisible]);

  const showCreatePlaylistModal = () => setIsCreateVisible(true);
  const hideCreatePlaylistModal = () => setIsCreateVisible(false);
  const showDeletePlaylistModal = () => setIsDeleteVisible(true);
  const hideDeletePlaylistModal = () => setIsDeleteVisible(false);

  const addSelectedTrackToPlaylistRef = useRef(() => {});

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

    setTimeout(() => {
      setIsShaking(false);
    }, 600);
  }

  useEffect(() => {
    if (isCreateVisible && playlistNameRef.current) {
      playlistNameRef.current.focus();
    }
  }, [isCreateVisible]);

  const handleCreatePlaylist = async () => {
    const newName = playlistNameRef.current.value;

    const nameLength = countNameLength(newName.trim());

    if (!newName.trim()) {
      triggerError("名前を入力してください");
      return;
    }

    if (nameLength > MAX_NAME_LENGTH) {
      triggerError(`文字数オーバーです`);
      return;
    }

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
      console.log("作成されたプレイリストID:", data.playlistId);
      showMessage("newPlaylist");
      playlistNameRef.current.value = "";
      setPreselectedTrack(null);
      hideCreatePlaylistModal();
    } catch {}

    // try {
    //   const playlistRef = await addDoc(collection(db, "playlists"), {
    //     name: newName,
    //     createdAt: serverTimestamp(),
    //   });
    //   console.log(preselectedTrack);
    //   if (preselectedTrack) {
    //     await addSelectedTrackToPlaylistRef.current(playlistRef.id);
    //     hideCreatePlaylistModal();
    //   }

    //   showMessage("newPlaylist");
    //   playlistNameRef.current.value = "";
    //   setPreselectedTrack(null);
    //   hideCreatePlaylistModal();
    // } catch (error) {
    //   console.error("作成失敗", error);
    // }
  };

  function formatTimeHours(time) {
    if (!time) {
      return "0分";
    }
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
  // 曲を削除するときにストレージにある画像と音声ファイルにあれば削除するｄ
  async function deleteTrack(playlistId, trackId) {
    fadeCoverImages();
    try {
      const trackRef = doc(db, "playlists", playlistId, "tracks", trackId);
      const trackSnap = await getDoc(trackRef);

      if (!trackSnap.exists()) return;

      const deletedTrack = trackSnap.data();

      if (deletedTrack.albumImagePath) {
        const coverRef = storageRef(storage, deletedTrack.albumImagePath);
        await deleteObject(coverRef);
      }

      if (deletedTrack.audioPath) {
        const audioRef = storageRef(storage, deletedTrack.audioPath);
        await deleteObject(audioRef);
      }

      await deleteDoc(trackRef);

      await updateDoc(doc(db, "playlists", playlistId), {
        totalDuration: increment(-deletedTrack.duration_ms),
      });
      setDeletedTrackDuration((prev) => prev + deletedTrack.duration_ms);

      setTracks((prevTracks) => prevTracks.filter((track) => track.id !== trackId));

      showMessage("deleteTrack");
    } catch {
      showMessage("deleteTrackFailed");
    }
  }

  async function deletePlaylist(playlistId) {
    try {
      const tracksRef = collection(db, "playlists", playlistId, "tracks");
      const tracksSnapshot = await getDocs(tracksRef);

      for (const trackDoc of tracksSnapshot.docs) {
        const data = trackDoc.data();

        if (data.albumImagePath) {
          const imageRef = storageRef(storage, data.albumImagePath);
          await deleteObject(imageRef);
        }

        if (data.audioPath) {
          const audioRef = storageRef(storage, data.audioPath);
          await deleteObject(audioRef);
        }

        await deleteDoc(trackDoc.ref);
      }

      const playlistRef = doc(db, "playlists", playlistId);
      await deleteDoc(playlistRef);

      navigate("/playlist");
      showMessage("deletePlaylist");
    } catch (e) {
      hideDeletePlaylistModal();
      showMessage("deletePlaylistFailed");
    }
  }

  function fadeCoverImages() {
    setIsCoverImageFading(true);

    setTimeout(() => {
      setIsCoverImageFading(false);
    }, 400);
  }

  useEffect(() => {
    console.log(preselectedTrack);
  }, [preselectedTrack]);

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
        deleteTrack,
        deletePlaylist,

        playlistId,
        setPlaylistId,

        tracks,
        setTracks,

        deletedTrackDuration,
        setDeletedTrackDuration,

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
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export default PlaylistContext;
