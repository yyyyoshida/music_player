import { create } from "zustand";

const usePlaybackStore = create((set) => ({
  queue: [],
  currentIndex: 0,
  currentTrackId: null,
  currentTitle: "曲のタイトル",
  currentArtistName: "アーティスト・作者",
  currentCoverImage: "/img/fallback-cover.png",

  setQueue: (queue) => set({ queue }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setCurrentTrackId: (currentTrackId) => set({ currentTrackId }),
  setCurrentTitle: (currentTitle) => set({ currentTitle }),
  setCurrentArtistName: (currentArtistName) => set({ currentArtistName }),
  setCurrentCoverImage: (currentCoverImage) => set({ currentCoverImage }),
}));

export default usePlaybackStore;
