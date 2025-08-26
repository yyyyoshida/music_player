import { create } from "zustand";

const usePlayerStore = create((set, get) => ({
  isPlaying: false,
  currentTime: 0,
  position: 0,
  duration: 0,
  playDisable: false,
  trackId: null,
  isLocalPlaying: false,
  isSpotifyPlaying: false,
  isLocalReady: false,
  audioRef: null,
  player: null,

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setPlayDisable: (isPlayDisable) => set({ playDisable: isPlayDisable }),
  setTrackId: (trackId) => set({ trackId }),
  setIsLocalPlaying: (isLocalPlaying) => set({ isLocalPlaying }),
  setIsSpotifyPlaying: (isSpotifyPlaying) => set({ isSpotifyPlaying }),
  setIsLocalReady: (isLocalReady) => set({ isLocalReady }),
  setAudioRef: (audioRef) => set({ audioRef }),
  setPlayer: (playerInstance) => set({ player: playerInstance }),

  togglePlayPause: async () => {
    const { isSpotifyPlaying, isLocalPlaying, player, audioRef, setIsPlaying } = get();

    if (isSpotifyPlaying && player) {
      const state = await player.getCurrentState();

      if (!state) return;

      if (state.paused) {
        await player.resume();
        setIsPlaying(true);
        return;
      }

      if (!state.paused) {
        await player.pause();
        setIsPlaying(false);
        return;
      }
    }

    if (isLocalPlaying && audioRef?.current) {
      const audio = audioRef.current;

      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
        return;
      }

      if (!audio.paused) {
        audio.pause();
        setIsPlaying(false);
        return;
      }
    }
  },
}));

export default usePlayerStore;
