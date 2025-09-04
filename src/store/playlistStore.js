import { create } from "zustand";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const MAX_NAME_LENGTH = 10;
const SHAKE_DURATION_MS = 600;

const usePlaylistStore = create((set) => ({
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

  setIsCreateVisible: (isCreateVisible) => set({ isCreateVisible }),
  setIsDeleteVisible: (isDeleteVisible) => set({ isDeleteVisible }),
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
  setPreselectedTrack: (preselectedTrack) => set({ preselectedTrack }),
  setIsCoverImageFading: (isCoverImageFading) => set({ isCoverImageFading }),

  goToPage: (navigate, path) => navigate(path),
}));

export default usePlaylistStore;
