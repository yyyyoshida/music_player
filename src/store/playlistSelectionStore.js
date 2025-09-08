import { create } from "zustand";
import usePlaylistStore from "./playlistStore";
import usePlaybackStore from "./playbackStore";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const usePlaylistSelectionStore = create((set, get) => ({
  isSelectVisible: false,
  selectedTrack: null,
  localCoverImageUrl: null,
  uploadTrackFile: null,

  setSelectedTrack: (selectedTrack) => set({ selectedTrack }),
  setLocalCoverImageUrl: (localCoverImageUrl) => set({ localCoverImageUrl }),
  setUploadTrackFile: (uploadTrackFile) => set({ uploadTrackFile }),

  openPlaylistSelectModal: () => set({ isSelectVisible: true }),
  closePlaylistSelectModal: () => set({ isSelectVisible: false }),

  addTrackToList: (playlistId, addedTrack) => {
    const { currentPlaylistId, setTracks, setAddedTrackDuration } = usePlaylistStore.getState();
    const { setQueue } = usePlaybackStore.getState();

    if (currentPlaylistId !== playlistId) return;

    setTracks((prev) => [...prev, addedTrack]);
    setQueue((prev) => [...prev, addedTrack]);
    setAddedTrackDuration((prev) => prev + addedTrack.duration_ms);
  },

  // executeTrackSave関数でtry-catchをラップしてるから不要↓
  saveTrackToFirestore: async (playlistId) => {
    const { addTrackToList, selectedTrack } = get();

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
  },

  saveUploadedLocalTrack: async (playlistId) => {
    const { addTrackToList, selectedTrack } = get();

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
  },

  blobUrlToFile: async (blobUrl, filename) => {
    const res = await fetch(blobUrl);
    if (!res.ok) throw new Error("Blob取得失敗");
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  },

  saveUploadAndNewTrack: async (playlistId) => {
    const { blobUrlToFile, localCoverImageUrl, uploadTrackFile, selectedTrack, addTrackToList } = get();
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
  },
}));

export default usePlaylistSelectionStore;
