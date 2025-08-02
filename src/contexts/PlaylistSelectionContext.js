import { createContext, useState, useRef, useContext, useEffect } from "react";
import { ActionSuccessMessageContext } from "../contexts/ActionSuccessMessageContext";
import { PlaylistContext } from "../contexts/PlaylistContext";
import { PlaybackContext } from "../contexts/PlaybackContext";
import { FALLBACK_COVER_IMAGE } from "../assets/icons";
import UploadModalContext from "./UploadModalContext";
import { usePlayerContext } from "../contexts/PlayerContext";

export const PlaylistSelectionContext = createContext();

export const PlaylistSelectionProvider = ({ children }) => {
  const [isSelectVisible, setIsSelectVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [localCoverImageUrl, setLocalCoverImageUrl] = useState(null);
  const [uploadTrackFile, setUploadTrackFile] = useState(null);

  const { showMessage } = useContext(ActionSuccessMessageContext);
  const { fadeCoverImages, currentPlaylistId, setPreselectedTrack, setAddedTrackDuration, addedTrackDuration, setTracks, tracks } =
    useContext(PlaylistContext);
  const { showUploadModal, hideUploadModal } = useContext(UploadModalContext);
  const { trackOrigin } = usePlayerContext();
  const { setQueue } = useContext(PlaybackContext);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const playlistNameRef = useRef("");

  // コンポーネントの関数と簡単な処理は可読性重視のためアロー関数で書く↓
  // それ以外はfunction宣言

  const toggleSelectVisible = () => setIsSelectVisible((prev) => !prev);

  const showSelectModal = () => setIsSelectVisible(true);

  const hideSelectPlaylistModal = () => setIsSelectVisible(false);

  function addTrackToList(playlistId, addedTrack) {
    if (currentPlaylistId !== playlistId) return;
    setTracks((prev) => [...prev, addedTrack]);
    setQueue((prev) => [...prev, addedTrack]);
    setAddedTrackDuration((prev) => prev + addedTrack.duration_ms);
  }

  // executeTrackSave関数でtry-catchをラップしてるから不要↓
  async function saveTrackToFirestore(playlistId) {
    const response = await fetch(`${BASE_URL}/api/playlists/${playlistId}/spotify-tracks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedTrack),
    });

    if (!response.ok) throw new Error("addFailedSpotify");

    const { addedTrack } = await response.json();
    addTrackToList(playlistId, addedTrack);
  }

  async function saveUploadedLocalTrack(playlistId) {
    const response = await fetch(`${BASE_URL}/api/playlists/${playlistId}/local-tracks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedTrack),
    });

    if (!response.ok) throw new Error("addFailedLocal");

    const { addedTrack } = await response.json();
    addTrackToList(playlistId, addedTrack);
  }

  async function blobUrlToFile(blobUrl, filename) {
    const res = await fetch(blobUrl);
    if (!res.ok) throw new Error("Blob取得失敗");
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  }

  async function saveUploadAndNewTrack(playlistId) {
    const formData = new FormData();

    let coverImageFile;

    try {
      coverImageFile = await blobUrlToFile(localCoverImageUrl, "cover.webp");
    } catch {
      coverImageFile = null;
    }

    if (coverImageFile) formData.append("cover", coverImageFile);
    formData.append("audio", uploadTrackFile);
    formData.append("track", JSON.stringify(selectedTrack));

    const response = await fetch(`${BASE_URL}/api/playlists/${playlistId}/local-tracks/new`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("addFailedNewLocal");

    const { addedTrack } = await response.json();
    addTrackToList(playlistId, addedTrack);
  }

  async function executeTrackSave(actionFunction) {
    try {
      await actionFunction();
      fadeCoverImages();
      showMessage("add");
      hideSelectPlaylistModal();
      hideUploadModal();
    } catch (error) {
      hideUploadModal();
      hideSelectPlaylistModal();
      showMessage(error.message);
    }
  }

  async function addTrackToPlaylist(playlistId) {
    if (!selectedTrack) return;

    const isNewLocalTrack = selectedTrack.source === "local" && selectedTrack.audioURL === undefined;
    const isSpotifyTrack = selectedTrack.trackUri;
    const isUploadedLocalTrack = selectedTrack.audioURL;

    if (isNewLocalTrack) {
      hideSelectPlaylistModal();
      showUploadModal();
    }
    // elseを使わず、returnで区切ったほうが個人的に読みやすかったのだが、
    // それ以降の共通処理 catch()とかが実行されないので
    // try-catch関数でラップして共通処理を走らせるようにした ↓↓↓

    if (isSpotifyTrack) {
      await executeTrackSave(() => saveTrackToFirestore(playlistId));
      return;
    }

    if (isUploadedLocalTrack) {
      await executeTrackSave(() => saveUploadedLocalTrack(playlistId));
      return;
    }

    await executeTrackSave(() => saveUploadAndNewTrack(playlistId));
  }

  function handleTrackSelect(track, shouldToggle = true, file = null, imageUrl = null) {
    console.log(trackOrigin, "どこから北のこの曲handleTrackSelect");

    if (trackOrigin === "searchResults") {
      setSelectedTrack({
        trackId: track.id,
        trackUri: track.uri,
        albumImage: track.album.images[1]?.url,
        title: track.name,
        artist: track.artists[0]?.name,
        duration_ms: track.duration_ms,
        source: "spotify",
      });
    } else if (trackOrigin === "firebase" && track.source === "spotify") {
      setSelectedTrack({
        trackId: track.trackId,
        trackUri: track.trackUri,
        albumImage: track.albumImage,
        title: track.title,
        artist: track.artist,
        duration_ms: track.duration_ms,
        source: "spotify",
      });
    } else if (trackOrigin === "local" || track.source === "local") {
      console.log(track);
      setSelectedTrack({
        title: track.title,
        artist: track.artist,
        duration_ms: track.duration_ms,
        albumImage: track.albumImage,
        albumImagePath: track.albumImagePath,
        audioPath: track.audioPath,
        audioURL: track.audioURL,
        source: "local",
      });
      if (file) setUploadTrackFile(file);
      if (imageUrl) setLocalCoverImageUrl(imageUrl);
    } else {
      setSelectedTrack({
        trackId: track.track.id,
        trackUri: track.track.uri,
        albumImage: track.track.album.images[1].url,
        title: track.track.name,
        artist: track.track.artists[0].name,
        duration: track.track.duration_ms,
        source: "spotify",
      });
    }

    if (shouldToggle) showSelectModal();
  }

  useEffect(() => {
    setPreselectedTrack(selectedTrack);
  }, [selectedTrack]);

  return (
    <PlaylistSelectionContext.Provider
      value={{
        toggleSelectVisible,
        isSelectVisible,
        setIsSelectVisible,
        playlistNameRef,
        addTrackToPlaylist,

        selectedTrack,
        setSelectedTrack,
        handleTrackSelect,
      }}
    >
      {children}
    </PlaylistSelectionContext.Provider>
  );
};

export default PlaylistSelectionContext;
