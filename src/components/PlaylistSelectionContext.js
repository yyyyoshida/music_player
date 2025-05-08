import React, { createContext, useState, useRef, useContext } from "react";
import { addDoc, collection, increment, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { ActionSuccessMessageContext } from "../contexts/ActionSuccessMessageContext";

export const PlaylistSelectionContext = createContext();

export const PlaylistSelectionProvider = ({ children }) => {
  const [isSelectVisible, setIsSelectVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const { showMessage } = useContext(ActionSuccessMessageContext);

  const playlistNameRef = useRef("");

  function toggleSelectVisible() {
    setIsSelectVisible((prev) => !prev);
  }

  const addTrackToPlaylist = async (playlistId) => {
    if (!selectedTrack) return;

    try {
      await addDoc(collection(db, "playlists", playlistId, "tracks"), {
        ...selectedTrack,
        addedAt: serverTimestamp(),
      });
      // console.log('✅ 曲追加成功');
      showMessage("add");

      await updateDoc(doc(db, "playlists", playlistId), {
        totalDuration: increment(selectedTrack.duration),
      });

      toggleSelectVisible();
    } catch (error) {
      console.error("💥 曲追加失敗", error);
    }
  };

  function handleTrackSelect(track, type, shouldToggle = true) {
    console.log(shouldToggle);
    if (type === "searchResults") {
      setSelectedTrack({
        trackId: track.id,
        trackUri: track.uri,
        albumImage: track.album.images[1]?.url,
        title: track.name,
        artist: track.artists[0]?.name,
        duration: track.duration_ms,
      });
    } else if (type === "firebase") {
      setSelectedTrack({
        trackId: track.trackId,
        trackUri: track.trackUri,
        albumImage: track.albumImage,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
      });
    } else {
      setSelectedTrack({
        trackId: track.track.id,
        trackUri: track.track.uri,
        albumImage: track.track.album.images[1].url,
        title: track.track.name,
        artist: track.track.artists[0].name,
        duration: track.track.duration_ms,
      });
    }

    if (shouldToggle) toggleSelectVisible();
  }

  return (
    <PlaylistSelectionContext.Provider
      value={{
        toggleSelectVisible,
        isSelectVisible,
        setIsSelectVisible,
        playlistNameRef,
        addTrackToPlaylist,
        setSelectedTrack,
        handleTrackSelect,
      }}
    >
      {children}
    </PlaylistSelectionContext.Provider>
  );
};

export default PlaylistSelectionContext;
