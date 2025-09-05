import { create } from "zustand";

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
  setTracks: (tracks) => set({ tracks }),
  // setTracks: (tracks) =>
  //   set((state) => ({
  //     tracks: Array.isArray(tracks) ? tracks : [tracks],
  //   })),
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
}));

export default usePlaylistStore;
