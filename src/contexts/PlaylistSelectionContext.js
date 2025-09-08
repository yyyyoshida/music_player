import { createContext, useRef, useEffect } from "react";
import { FALLBACK_COVER_IMAGE } from "../assets/icons";
import { clearPlaylistCache } from "../utils/clearPlaylistCache";
import usePlaybackStore from "../store/playbackStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import usePlaylistStore from "../store/playlistStore";
import useUploadModalStore from "../store/uploadModalStore";
import usePlaylistSelectionStore from "../store/playlistSelectionStore";

export const PlaylistSelectionContext = createContext();

export const PlaylistSelectionProvider = ({ children }) => {
  const trackOrigin = usePlaybackStore((state) => state.trackOrigin);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);
  const showUploadModal = useUploadModalStore((state) => state.showUploadModal);
  const hideUploadModal = useUploadModalStore((state) => state.hideUploadModal);
  const setPreselectedTrack = usePlaylistStore((state) => state.setPreselectedTrack);
  const fadeCoverImages = usePlaylistStore((state) => state.fadeCoverImages);

  const selectedTrack = usePlaylistSelectionStore((state) => state.selectedTrack);
  const setSelectedTrack = usePlaylistSelectionStore((state) => state.setSelectedTrack);
  const setLocalCoverImageUrl = usePlaylistSelectionStore((state) => state.setLocalCoverImageUrl);
  const setUploadTrackFile = usePlaylistSelectionStore((state) => state.setUploadTrackFile);
  const saveTrackToFirestore = usePlaylistSelectionStore((state) => state.saveTrackToFirestore);
  const saveUploadedLocalTrack = usePlaylistSelectionStore((state) => state.saveUploadedLocalTrack);
  const saveUploadAndNewTrack = usePlaylistSelectionStore((state) => state.saveUploadAndNewTrack);
  const openPlaylistSelectModal = usePlaylistSelectionStore((state) => state.openPlaylistSelectModal);
  const closePlaylistSelectModal = usePlaylistSelectionStore((state) => state.closePlaylistSelectModal);

  const playlistNameRef = useRef("");

  // コンポーネントの関数と簡単な処理は可読性重視のためアロー関数で書く↓
  // それ以外はfunction宣言

  async function executeTrackSave(actionFunction, id) {
    try {
      await actionFunction();
      fadeCoverImages();
      showMessage("add");
      closePlaylistSelectModal();
      hideUploadModal();
      clearPlaylistCache(id);
      console.log(id);
    } catch (error) {
      hideUploadModal();
      closePlaylistSelectModal();
      showMessage(error.message);
      console.log(error.message);
    }
  }

  async function addTrackToPlaylist(playlistId) {
    if (!selectedTrack) return;

    const isNewLocalTrack = selectedTrack.source === "local" && selectedTrack.audioURL === undefined;
    const isSpotifyTrack = selectedTrack.trackUri;
    const isUploadedLocalTrack = selectedTrack.audioURL;

    if (isNewLocalTrack) {
      closePlaylistSelectModal();
      showUploadModal();
    }
    // elseを使わず、returnで区切ったほうが個人的に読みやすかったのだが、
    // それ以降の共通処理 catch()とかが実行されないので
    // try-catch関数でラップして共通処理を走らせるようにした ↓↓↓

    if (isSpotifyTrack) {
      await executeTrackSave(() => saveTrackToFirestore(playlistId), playlistId);
      return;
    }

    if (isUploadedLocalTrack) {
      await executeTrackSave(() => saveUploadedLocalTrack(playlistId), playlistId);
      return;
    }

    await executeTrackSave(() => saveUploadAndNewTrack(playlistId), playlistId);
  }

  function handleTrackSelect(track, shouldToggle = true, file = null, imageUrl = null) {
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

    if (shouldToggle) openPlaylistSelectModal();
  }

  useEffect(() => {
    setPreselectedTrack(selectedTrack);
  }, [selectedTrack]);

  return (
    <PlaylistSelectionContext.Provider
      value={{
        playlistNameRef,
        addTrackToPlaylist,

        handleTrackSelect,
      }}
    >
      {children}
    </PlaylistSelectionContext.Provider>
  );
};

export default PlaylistSelectionContext;
