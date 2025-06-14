import { createContext, useState, useContext, useRef, useEffect } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { deleteObject, ref as storageRef } from "firebase/storage";
import { storage } from "../firebase"; // ストレージのインスタンスね！
import { ActionSuccessMessageContext } from "./ActionSuccessMessageContext";
import { useNavigate } from "react-router-dom";

export const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
  const [isCreateVisible, setIsCreateVisible] = useState(false);
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

  function toggleCreateVisible() {
    setErrorMessage("");
    setIsCreateVisible((prev) => !prev);
  }

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
      playlistNameRef.current.focus(); // ← これでEnterの発火対象がinputになる
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
      const playlistRef = await addDoc(collection(db, "playlists"), {
        name: newName,
        createdAt: serverTimestamp(),
        ...(preselectedTrack ? { totalDuration: preselectedTrack.duration_ms } : {}),
      });

      if (preselectedTrack) {
        await addDoc(collection(db, "playlists", playlistRef.id, "tracks"), {
          ...preselectedTrack,
          addedAt: serverTimestamp(),
        });
      }

      showMessage("newPlaylist");
      playlistNameRef.current.value = "";
      setPreselectedTrack(null);
      toggleCreateVisible();
    } catch (error) {
      console.error("作成失敗", error);
    }
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
  // 曲を削除するときにストレージにある画像と音声ファイルをしっかり
  // 削除するｄ
  async function deleteTrack(playlistId, trackId) {
    fadeCoverImages();
    try {
      const trackRef = doc(db, "playlists", playlistId, "tracks", trackId);
      const trackSnap = await getDoc(trackRef);

      if (!trackSnap.exists()) {
        console.warn("削除対象のトラックが存在しない"); //今後これの警告トースト通知をつくる
        return;
      }

      const deletedTrack = trackSnap.data();

      // ストレージの画像や音声を削除
      if (deletedTrack.imagePath) {
        const coverRef = storageRef(storage, deletedTrack.imagePath);
        await deleteObject(coverRef).catch((err) => {
          console.warn("カバー画像削除失敗", err);
        });
      }

      if (deletedTrack.audioPath) {
        const audioRef = storageRef(storage, deletedTrack.audioPath);
        await deleteObject(audioRef).catch((err) => {
          console.warn("音声ファイル削除失敗", err);
        });
      }

      await deleteDoc(trackRef);

      await updateDoc(doc(db, "playlists", playlistId), {
        totalDuration: increment(-deletedTrack.duration_ms),
      });
      setDeletedTrackDuration((prev) => prev + deletedTrack.duration_ms);

      setTracks((prevTracks) => prevTracks.filter((track) => track.id !== trackId));

      showMessage("deleteTrack");
      console.log("削除成功");
    } catch (err) {
      console.error("削除失敗", err);
    }
  }

  async function deletePlaylist(playlistId) {
    try {
      await deleteDoc(doc(db, "playlists", playlistId));
      console.log("プレイリスト削除成功");
      navigate("/playlist");
      showMessage("deletePlaylist");
    } catch (err) {
      console.error("プレイリスト削除失敗", err);
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
        toggleCreateVisible,
        isCreateVisible,
        setIsCreateVisible,
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
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export default PlaylistContext;
