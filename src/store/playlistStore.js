import { create } from "zustand";
import { clearPlaylistCache } from "../utils/clearPlaylistCache";
import useActionSuccessMessageStore from "./actionSuccessMessageStore";
import { getPlaylistInfo } from "../utils/playlistUtils";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const MAX_NAME_LENGTH = 10;

const usePlaylistStore = create((set, get) => ({
  isCreateVisible: false,
  isDeleteVisible: false,
  playlistInfo: { name: "", totalDuration: 0 },
  playlists: [],
  currentPlaylistId: null,
  tracks: [],
  deletedTrackDuration: 0,
  addedTrackDuration: 0,

  errorMessage: "",
  isShaking: false,
  preselectedTrack: null,
  isCoverImageFading: false,

  playlistNameRef: "",
  addSelectedTrackToPlaylistRef: () => {},

  setPlaylistInfo: (playlistInfo) => set({ playlistInfo }),
  setPlaylists: (playlists) => set({ playlists }),
  setCurrentPlaylistId: (currentPlaylistId) => set({ currentPlaylistId }),

  // 関数型更新(prev => [...prev, addedTrack])を渡してtracksを更新できるように↓↓
  setTracks: (value) =>
    set((state) => {
      const isArray = Array.isArray(value);

      if (isArray) return { tracks: value };

      if (!isArray) return { tracks: value(state.tracks) };
    }),

  setDeletedTrackDuration: (deletedTrackDuration) => set({ deletedTrackDuration }),
  setAddedTrackDuration: (addedTrackDuration) => set({ addedTrackDuration }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setIsShaking: (isShaking) => set({ isShaking }),
  setPreselectedTrack: (preselectedTrack) => set({ preselectedTrack }),
  setIsCoverImageFading: (isCoverImageFading) => set({ isCoverImageFading }),
  setPlaylistNameRef: (playlistNameRef) => set({ playlistNameRef }),

  goToPage: (navigate, path) => navigate(path),

  showCreatePlaylistModal: () => {
    const { playlistNameRef } = get();

    set({ isCreateVisible: true, errorMessage: "" });
    playlistNameRef.current.value = "";
  },

  hideCreatePlaylistModal: () => {
    set({ isCreateVisible: false });
  },

  showDeletePlaylistModal: () => {
    set({ isDeleteVisible: true });
  },

  hideDeletePlaylistModal: () => {
    set({ isDeleteVisible: false });
  },

  countNameLength: (string) => {
    let nameLength = 0;
    for (let i = 0; i < string.length; i++) {
      const code = string.charCodeAt(i);
      nameLength += code <= 0x007f ? 0.5 : 1;
    }
    return nameLength;
  },

  triggerError: (message) => {
    set({ errorMessage: message, isShaking: true });
  },

  handleCreatePlaylist: async () => {
    const { playlistNameRef, countNameLength, hideCreatePlaylistModal, triggerError } = get();

    const newName = playlistNameRef.current.value;
    const nameLength = countNameLength(newName.trim());

    if (!newName.trim()) {
      triggerError("名前を入力してください");
      return;
    }

    if (nameLength > MAX_NAME_LENGTH) {
      triggerError("文字数オーバーです");
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
      console.log(data);
      // showMessage("newPlaylist");
      playlistNameRef.current.value = "";
      set({ preselectedTrack: null });
      hideCreatePlaylistModal();
    } catch {}
  },

  deletePlaylist: async (playlistId, navigate) => {
    const { hideDeletePlaylistModal } = get();
    const showMessage = useActionSuccessMessageStore.getState().showMessage;

    try {
      const response = await fetch(`${BASE_URL}/api/playlists/${playlistId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("プレイリスト削除失敗");

      clearPlaylistCache();
      navigate("/playlist");
      showMessage("deletePlaylist");
    } catch {
      showMessage("deletePlaylistFailed");
    } finally {
      hideDeletePlaylistModal();
    }
  },

  showCoverImages: () => set({ isCoverImageFading: false }),
  fadeCoverImages: () => set({ isCoverImageFading: true }),

  deleteTrack: async (trackId) => {
    const { currentPlaylistId, deletedTrackDuration, tracks, fadeCoverImages, clearPlaylistCache } = get();
    const showMessage = useActionSuccessMessageStore.getState().showMessage;

    try {
      const playlistInfoData = await getPlaylistInfo(currentPlaylistId);
      const totalDuration = playlistInfoData.totalDuration;

      const response = await fetch(`${BASE_URL}/api/playlists/${currentPlaylistId}/tracks/${trackId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("楽曲削除失敗");

      const { deletedTrack } = await response.json();

      const newDeletedTrackDuration = deletedTrackDuration + deletedTrack.duration_ms;
      const resultTotalDuration = totalDuration - newDeletedTrackDuration;
      const updatedInfoData = { ...playlistInfoData, totalDuration: resultTotalDuration };
      localStorage.setItem(`playlistDetail:${currentPlaylistId}Info`, JSON.stringify(updatedInfoData));

      const updatedTracks = tracks.filter((track) => track.id !== trackId);
      localStorage.setItem(`playlistDetail:${currentPlaylistId}Tracks`, JSON.stringify(updatedTracks));

      set({
        deletedTrackDuration: newDeletedTrackDuration,
        tracks: updatedTracks,
      });

      fadeCoverImages();
      showMessage("deleteTrack");
      clearPlaylistCache();
    } catch (error) {
      showMessage("deleteTrackFailed");
    }
  },
}));

export default usePlaylistStore;
