import React, { createContext, useState, useContext, useRef, useEffect } from "react";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { ActionSuccessMessageContext } from "../contexts/ActionSuccessMessageContext";

export const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const playlistNameRef = useRef("");
  const [playlistInfo, setPlaylistInfo] = useState({ title: "", duration: 0 });
  const [playlistName, setPlaylistName] = useState(playlistInfo.name);
  const { showMessage } = useContext(ActionSuccessMessageContext);
  const [playlistId, setPlaylistId] = useState(null);
  const [tracks, setTracks] = useState([]);

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
    console.log(playlistId, trackId);
    console.log(`/playlists/${playlistId}/tracks/${trackId}`);

    try {
      await deleteDoc(doc(db, "playlists", playlistId, "tracks", trackId));
      // setTracks((prevTracks) => prevTracks.filter((track) => track.id !== trackId));
      setTracks((prevTracks) =>
        // prevTracks: 以前のtracksの状態
        prevTracks.filter(
          (track) =>
            // track.id !== trackId: 削除したいtrackIdを持つトラックを除外
            track.id !== trackId // trackIdと一致しないトラックだけを新しい配列に残す
        )
      );
      showMessage("delete");
      console.log("削除成功");
    } catch (err) {
      console.error("削除失敗", err);
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

        playlistId,
        setPlaylistId,

        tracks,
        setTracks,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export default PlaylistContext;
