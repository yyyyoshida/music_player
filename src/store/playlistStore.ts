import { create } from "zustand";
import { clearPlaylistCache } from "../utils/clearPlaylistCache";
import { getPlaylistInfo } from "../utils/playlistUtils";
import useActionSuccessMessageStore from "./actionSuccessMessageStore";
import validatePlaylistName from "../utils/validatePlaylistName";
import type { TrackObject } from "./playbackStore";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export type PlaylistObject = {
  albumImages: string;
  createdAt: any;
  id: string;
  name: string;
  totalDuration: number;
  trackCount: number;
};

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

  errorMessage: string;
  isShaking: boolean;
  preselectedTrack: PlaylistObject | null;
  isCoverImageFading: boolean;
  playlistNameRef: string | null;

  addSelectedTrackToPlaylistRef: () => void;

  setPlaylistInfo: (playlistInfo: PlaylistInfo) => void;
  setPlaylists: (playlists: PlaylistObject[]) => void;
  setCurrentPlaylistId: (currentPlaylistId: string | null) => void;

  setTracks: (value: TrackObject[] | ((prev: TrackObject[]) => TrackObject[])) => void;
  setDeletedTrackDuration: (deletedTrackDuration: number) => void;
  setAddedTrackDuration: (updater: number | ((prev: number) => number)) => number | void;

  setErrorMessage: (errorMessage: string) => void;
  setIsShaking: (isShaking: boolean) => void;
  setPreselectedTrack: (preselectedTrack: PlaylistObject | null) => void;
  setIsCoverImageFading: (isCoverImageFading: boolean) => void;
  setPlaylistNameRef: (playlistNameRef: string | null) => void;

  goToPage: (navigate: (path: string) => void, path: string) => void;

  showCreatePlaylistModal: () => void;
  hideCreatePlaylistModal: () => void;
  showDeletePlaylistModal: () => void;
  hideDeletePlaylistModal: () => void;
  triggerError: (message: string) => void;
  handleCreatePlaylist: () => Promise<void> | Promise<string>;
  deletePlaylist: (playlistId: string, navigate: (url: string) => void) => Promise<void>;
  showCoverImages: () => void;
  fadeCoverImages: () => void;
  deleteTrack: (trackId: string) => Promise<void>;
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

      return isArray ? { tracks: value } : { tracks: value(state.tracks) };
    }),

  setDeletedTrackDuration: (deletedTrackDuration) => set({ deletedTrackDuration }),
  setAddedTrackDuration: (updater) =>
    set((state) => ({
      addedTrackDuration: typeof updater === "function" ? updater(state.addedTrackDuration) : updater,
    })),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setIsShaking: (isShaking) => set({ isShaking }),
  setPreselectedTrack: (preselectedTrack) => set({ preselectedTrack }),
  setIsCoverImageFading: (isCoverImageFading) => set({ isCoverImageFading }),
  setPlaylistNameRef: (playlistNameRef) => set({ playlistNameRef }),

  goToPage: (navigate, path) => navigate(path),

  showCreatePlaylistModal: () => {
    set({ isCreateVisible: true, errorMessage: "", playlistNameRef: "" });
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

  handleCreatePlaylist: async () => {
    const { playlistNameRef, setPlaylistNameRef, hideCreatePlaylistModal, triggerError } = get();
    const showMessage = useActionSuccessMessageStore.getState().showMessage;
    const newName = playlistNameRef ?? "";

    const validationError = validatePlaylistName(newName);

    if (validationError) {
      return triggerError(validationError);
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
        try {
          // サーバー側のプレイリスト名のバリデーションエラーが入る
          const data = await response.json();
          triggerError(data.error);
        } catch (error) {
          // バリデーション以外のエラー
          console.error("プレイリスト名バリデーション以外のエラー", error);
          showMessage("newPlaylistFailed");
          hideCreatePlaylistModal();
        }
        return;
      }

      const data = await response.json();
      console.log(data);
      showMessage("newPlaylist");
      setPlaylistNameRef("");
      set({ preselectedTrack: null });
      hideCreatePlaylistModal();
    } catch {
      showMessage("newPlaylistFailed");
      hideCreatePlaylistModal();
    }
  },

  deletePlaylist: async (playlistId, navigate) => {
    const { hideDeletePlaylistModal } = get();
    const showMessage = useActionSuccessMessageStore.getState().showMessage;

    try {
      const response = await fetch(`${BASE_URL}/api/playlists/${playlistId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("プレイリスト削除失敗");

      clearPlaylistCache(playlistId);
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
    const { currentPlaylistId, setPlaylistInfo, deletedTrackDuration, tracks, fadeCoverImages } = get();
    const showMessage = useActionSuccessMessageStore.getState().showMessage;

    const playlistId = currentPlaylistId ?? "";

    try {
      const playlistInfoData = await getPlaylistInfo(playlistId, setPlaylistInfo, showMessage);
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
      clearPlaylistCache(playlistId);
    } catch (error) {
      showMessage("deleteTrackFailed");
    }
  },
}));

export default usePlaylistStore;
