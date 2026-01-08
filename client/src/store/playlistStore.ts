import { create } from "zustand";
import { clearPlaylistCache } from "../features/playlist/playlistCache";
import { getPlaylistInfo } from "../features/playlist/playlistActions";
import useActionSuccessMessageStore from "./actionSuccessMessageStore";
import type { TrackObject } from "../types/tracksType";
import type { PlaylistObject } from "../types/playlistType";
import { API } from "../api/apis";
import { STORAGE_KEYS } from "../utils/storageKeys";

type PlaylistInfo = {
  name: string;
  totalDuration: number;
};

type PlaylistStore = {
  isCreateVisible: boolean;
  isDeleteVisible: boolean;
  playlistInfo: PlaylistInfo;
  playlists: PlaylistObject[];
  currentPlaylistId: string | null;
  tracks: TrackObject[];
  deletedTrackDuration: number;
  addedTrackDuration: number;
  isDeletingTrack: boolean;

  errorMessage: string;
  isShaking: boolean;
  isCoverImageFading: boolean;
  refreshTrigger: number;

  addSelectedTrackToPlaylistRef: () => void;

  setPlaylistInfo: (playlistInfo: PlaylistInfo) => void;
  setPlaylists: (playlists: PlaylistObject[]) => void;
  setCurrentPlaylistId: (currentPlaylistId: string | null) => void;

  setTracks: (value: TrackObject[] | ((prev: TrackObject[]) => TrackObject[])) => void;
  setDeletedTrackDuration: (deletedTrackDuration: number) => void;
  setAddedTrackDuration: (updater: number | ((prev: number) => number)) => number | void;
  setIsDeletingTrack: (isDeletingTrack: boolean) => void;

  setErrorMessage: (errorMessage: string) => void;
  setIsShaking: (isShaking: boolean) => void;
  setIsCoverImageFading: (isCoverImageFading: boolean) => void;
  setRefreshTrigger: (value: number | ((prev: number) => number)) => void;

  goToPage: (navigate: (path: string) => void, path: string) => void;

  showCreatePlaylistModal: () => void;
  hideCreatePlaylistModal: () => void;
  showDeletePlaylistModal: () => void;
  hideDeletePlaylistModal: () => void;
  triggerError: (message: string) => void;
  showCoverImages: () => void;
  fadeCoverImages: () => void;
  deleteTrack: (
    trackId: string | null,
    isShowMessage?: boolean,
    selectedPlaylistId?: string | null
  ) => Promise<void>;
};

const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  isCreateVisible: false,
  isDeleteVisible: false,
  playlistInfo: { name: "", totalDuration: 0 },
  playlists: [],
  currentPlaylistId: null,
  tracks: [],
  deletedTrackDuration: 0,
  addedTrackDuration: 0,
  isDeletingTrack: false,

  errorMessage: "",
  isShaking: false,
  isCoverImageFading: false,
  refreshTrigger: 0,

  addSelectedTrackToPlaylistRef: () => {},

  setPlaylistInfo: (playlistInfo) => set({ playlistInfo }),
  setPlaylists: (playlists) => set({ playlists }),
  setCurrentPlaylistId: (currentPlaylistId) => set({ currentPlaylistId }),

  // 関数型更新(prev => [...prev, addedTrack])を渡してtracksを更新できるように↓↓
  setTracks: (value) =>
    set((state) => {
      const isArray = Array.isArray(value);

      return isArray ? { tracks: value } : { tracks: value(state.tracks) };
    }),

  setDeletedTrackDuration: (deletedTrackDuration) => set({ deletedTrackDuration }),
  setAddedTrackDuration: (updater) =>
    set((state) => ({
      addedTrackDuration: typeof updater === "function" ? updater(state.addedTrackDuration) : updater,
    })),
  setIsDeletingTrack: (isDeletingTrack) => set({ isDeletingTrack }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setIsShaking: (isShaking) => set({ isShaking }),
  setIsCoverImageFading: (isCoverImageFading) => set({ isCoverImageFading }),
  setRefreshTrigger: (value) =>
    set((state) => ({ refreshTrigger: typeof value === "function" ? value(state.refreshTrigger) : value })),

  goToPage: (navigate, path) => navigate(path),

  showCreatePlaylistModal: () => {
    set({ isCreateVisible: true, errorMessage: "" });
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

  triggerError: (message) => {
    set({ errorMessage: message, isShaking: true });
  },

  showCoverImages: () => set({ isCoverImageFading: false }),
  fadeCoverImages: () => set({ isCoverImageFading: true }),

  deleteTrack: async (trackId, isShowMessage = true, selectedPlaylistId = null) => {
    const {
      currentPlaylistId,
      setPlaylistInfo,
      deletedTrackDuration,
      tracks,
      fadeCoverImages,
      setIsDeletingTrack,
    } = get();
    const showMessage = useActionSuccessMessageStore.getState().showMessage;
    setIsDeletingTrack(true);

    try {
      if (!currentPlaylistId) throw new Error("currentPlaylistIdが無効");
      if (!trackId) throw new Error("trackIdが無効");

      const playlistId = selectedPlaylistId ? selectedPlaylistId : currentPlaylistId;

      const playlistInfoData = await getPlaylistInfo(playlistId, setPlaylistInfo, showMessage);
      const totalDuration = playlistInfoData.totalDuration;

      const response = await fetch(API.deleteTrack(playlistId, trackId), {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("楽曲削除失敗");

      const { deletedTrack } = await response.json();

      const newDeletedTrackDuration = deletedTrackDuration + deletedTrack.duration_ms;
      const resultTotalDuration = totalDuration - newDeletedTrackDuration;
      const updatedInfoData = { ...playlistInfoData, totalDuration: resultTotalDuration };
      localStorage.setItem(
        STORAGE_KEYS.getCachedPlaylistInfoKey(playlistId),
        JSON.stringify(updatedInfoData)
      );

      const updatedTracks = tracks.filter((track) => track.id !== trackId);
      localStorage.setItem(STORAGE_KEYS.getCachedTracksKey(playlistId), JSON.stringify(updatedTracks));

      set({
        deletedTrackDuration: newDeletedTrackDuration,
        tracks: updatedTracks,
      });

      fadeCoverImages();
      if (isShowMessage) showMessage("deleteTrack");
      clearPlaylistCache(playlistId);
    } catch (error) {
      showMessage("deleteTrackFailed");
    } finally {
      setIsDeletingTrack(false);
    }
  },
}));

export default usePlaylistStore;
