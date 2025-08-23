import { create } from "zustand";

const usePlayerStore = create((set) => ({
  isPlaying: false,
  currentTime: 0,
  position: 0,
  duration: 0,

  playDisable: false,
  trackId: null,
  isLocalPlaying: false,
  isSpotifyPlaying: false,
  isLocalReady: false,

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),

  setPlayDisable: (isPlayDisable) => set({ playDisable: isPlayDisable }),
  setTrackId: (trackId) => set({ trackId }),
  setIsLocalPlaying: (isLocalPlaying) => set({ isLocalPlaying }),
  setIsSpotifyPlaying: (isSpotifyPlaying) => set({ isSpotifyPlaying }),
  setIsLocalReady: (isLocalReady) => set({ isLocalReady }),
}));

export default usePlayerStore;
