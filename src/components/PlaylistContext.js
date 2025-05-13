import React, { createContext, useState, useContext, useRef, useEffect } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { ActionSuccessMessageContext } from "../contexts/ActionSuccessMessageContext";
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
  const [totalDuration, setTotalDuration] = useState({});
  const navigate = useNavigate();

  function toggleCreateVisible() {
    setIsCreateVisible((prev) => !prev);
  }

  const handleCreatePlaylist = async () => {
    if (!playlistNameRef.current.value.trim()) {
      alert("値を入れろゴラァあ！！");
      return;
    }

    try {
      await addDoc(collection(db, "playlists"), {
        name: playlistNameRef.current.value,
        createdAt: serverTimestamp(),
      });
      // console.log('プレイリスト作成成功');
      showMessage("newPlaylist");
      playlistNameRef.current.value = "";

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

  async function deleteTrack(playlistId, trackId) {
    try {
      const trackRef = doc(db, "playlists", playlistId, "tracks", trackId);
      const trackSnap = await getDoc(trackRef);

      if (!trackSnap.exists()) {
        console.warn("削除対象のトラックが存在しない"); //今後これの警告トースト通知をつくる
        return;
      }

      const deletedTrack = trackSnap.data();

      await deleteDoc(trackRef);

      await updateDoc(doc(db, "playlists", playlistId), {
        totalDuration: increment(-deletedTrack.duration),
      });
      setTotalDuration((prev) => prev - deletedTrack.duration);

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

        totalDuration,
        setTotalDuration,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export default PlaylistContext;
