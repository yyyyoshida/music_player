import { createContext, useEffect } from "react";
import { FALLBACK_COVER_IMAGE } from "../assets/icons";
import usePlaybackStore from "../store/playbackStore";
import usePlaylistStore from "../store/playlistStore";
import usePlaylistSelectionStore from "../store/playlistSelectionStore";

export const PlaylistSelectionContext = createContext();

export const PlaylistSelectionProvider = ({ children }) => {
  const trackOrigin = usePlaybackStore((state) => state.trackOrigin);

  const setPreselectedTrack = usePlaylistStore((state) => state.setPreselectedTrack);

  const selectedTrack = usePlaylistSelectionStore((state) => state.selectedTrack);
  const setSelectedTrack = usePlaylistSelectionStore((state) => state.setSelectedTrack);
  const setLocalCoverImageUrl = usePlaylistSelectionStore((state) => state.setLocalCoverImageUrl);
  const setUploadTrackFile = usePlaylistSelectionStore((state) => state.setUploadTrackFile);

  const openPlaylistSelectModal = usePlaylistSelectionStore((state) => state.openPlaylistSelectModal);

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
        handleTrackSelect,
      }}
    >
      {children}
    </PlaylistSelectionContext.Provider>
  );
};

export default PlaylistSelectionContext;
