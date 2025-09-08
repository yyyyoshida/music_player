import { create } from "zustand";

const usePlaybackStore = create((set) => ({
  queue: [],
  currentIndex: 0,
  currentTrackId: null,
  currentPlayedAt: null,
  currentTitle: "曲のタイトル",
  currentArtistName: "アーティスト・作者",
  currentCoverImage: "/img/fallback-cover.png",
  trackOrigin: null,

  setQueue: (queue) => set({ queue }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setCurrentTrackId: (currentTrackId) => set({ currentTrackId }),
  setCurrentPlayedAt: (currentPlayedAt) => set({ currentPlayedAt }),
  setCurrentTitle: (currentTitle) => set({ currentTitle }),
  setCurrentArtistName: (currentArtistName) => set({ currentArtistName }),
  setCurrentCoverImage: (currentCoverImage) => set({ currentCoverImage }),
  setTrackOrigin: (trackOrigin) => set({ trackOrigin }),
}));

export default usePlaybackStore;
