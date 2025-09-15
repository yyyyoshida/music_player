import { create } from "zustand";
import usePlayerStore from "./playerStore";

const usePlaybackStore = create((set, get) => ({
  queue: [],
  currentIndex: 0,
  currentTrackId: null,
  currentPlayedAt: null,
  currentTitle: "曲のタイトル",
  currentArtistName: "アーティスト・作者",
  currentCoverImage: "/img/fallback-cover.png",
  trackOrigin: null,

  // setQueue: (queue) => set({ queue }),
  setQueue: (updater) =>
    set((state) => ({
      queue: typeof updater === "function" ? updater(state.queue) : updater,
    })),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setCurrentTrackId: (currentTrackId) => set({ currentTrackId }),
  setCurrentPlayedAt: (currentPlayedAt) => set({ currentPlayedAt }),
  setCurrentTitle: (currentTitle) => set({ currentTitle }),
  setCurrentArtistName: (currentArtistName) => set({ currentArtistName }),
  setCurrentCoverImage: (currentCoverImage) => set({ currentCoverImage }),
  setTrackOrigin: (trackOrigin) => set({ trackOrigin }),

  setTrackIndex: (index) => {
    const { queue, currentIndex, setCurrentIndex } = get();

    const isValidIndex = index >= 0 && index < queue.length;
    if (isValidIndex && index !== currentIndex) {
      setCurrentIndex(index);
    }
  },

  updateTrackInfo: (track) => {
    const { setCurrentTrackId, setCurrentArtistName, setCurrentTitle, setCurrentCoverImage } = get();
    const { setCurrentTime, setDuration } = usePlayerStore.getState();

    if (!track) return;

    setCurrentTrackId(track.id);
    setCurrentArtistName(track.artist || track.artists?.[0]?.name);
    setCurrentTitle(track.title || track.name);
    setCurrentCoverImage(track.albumImage || track.album?.images?.[0]?.url);
    setCurrentTime(0);
    setDuration(0);
  },

  playTrack: (track) => {
    const { playDisable, playerTrack } = usePlayerStore.getState();

    if (!track || playDisable) return;
    const uriToPlay = track.uri || track.trackUri || track.audioURL;
    playerTrack(uriToPlay, track.source);
  },

  updateCurrentIndex: (index) => {
    const { currentIndex, queue, updateTrackInfo, playTrack, setTrackIndex } = get();

    const track = queue[index];
    if (!track || index === currentIndex) return;

    updateTrackInfo(track);
    playTrack(track);
    setTrackIndex(index);
  },

  goToNextTrack: () => {
    const { currentIndex, queue, updateCurrentIndex } = get();
    const { playDisable } = usePlayerStore.getState();

    if (playDisable) return;
    const nextIndex = Math.min(currentIndex + 1, queue.length - 1);
    if (nextIndex !== currentIndex) {
      updateCurrentIndex(nextIndex);
    }
  },

  goToPreviousTrack: () => {
    const { currentIndex, updateCurrentIndex } = get();
    const { playDisable } = usePlayerStore.getState();

    if (playDisable) return;
    const prevIndex = Math.max(currentIndex - 1, 0);
    if (prevIndex !== currentIndex) {
      updateCurrentIndex(prevIndex);
    }
  },
}));

export default usePlaybackStore;
