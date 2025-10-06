import { create } from "zustand";
import usePlayerStore from "./playerStore";

interface BaseTrack {
  addedAt?: string;
  albumImage: string;
  artist: string;
  duration_ms: number;
  id?: string;
  title: string;
}

interface SpotifyTrack extends BaseTrack {
  source: "spotify";
  trackId: string;
  trackUri: string;
}

interface LocalTrack extends BaseTrack {
  source: "local";
  albumImagePath: string;
  audioPath: string;
  audioURL: string;
}

type fromSearchResultTrackImages = {
  height: number;
  width: number;
  url: string;
};

export type fromSearchResultTrackObject = {
  id: string;
  uri: string;
  album: {
    images: fromSearchResultTrackImages[];
  };
  name: string;
  artists: {
    name: string;
  }[];
  duration_ms: number;
};

export type TrackObject = SpotifyTrack | LocalTrack | fromSearchResultTrackObject;

type PlaybackStore = {
  queue: TrackObject[];
  currentIndex: number;
  currentTrackId: string | null;
  currentPlayedAt: Date | null;
  currentTitle: string;
  currentArtistName: string;
  currentCoverImage: string;
  trackOrigin: "searchResults" | "firebase" | "local" | null;
  isPrevDisabled: boolean;
  isNextDisabled: boolean;

  setQueue: (updater: TrackObject[] | ((prev: TrackObject[]) => TrackObject[])) => void;
  setCurrentIndex: (currentIndex: number) => void;
  setCurrentTrackId: (currentTrackId: string | null) => void;
  setCurrentPlayedAt: (currentPlayedAt: Date | null) => void;
  setCurrentTitle: (currentTitle: string) => void;
  setCurrentArtistName: (currentArtistName: string) => void;
  setCurrentCoverImage: (currentCoverImage: string) => void;
  setTrackOrigin: (trackOrigin: "searchResults" | "firebase" | "local" | null) => void;
  setIsPrevDisabled: (isPrevDisabled: boolean) => void;
  setIsNextDisabled: (isNextDisabled: boolean) => void;

  setTrackIndex: (index: number) => void;
  syncTrackInfo: (track: any) => void; // 後でtrackの専用の型を作る
  playTrack: (track: any) => void;
  playTrackAtIndex: (index: number) => void;
  goToNextTrack: () => void;
  goToPreviousTrack: () => void;
};

const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  queue: [],
  currentIndex: 0,
  currentTrackId: null,
  currentPlayedAt: null,
  currentTitle: "曲のタイトル",
  currentArtistName: "アーティスト・作者",
  currentCoverImage: "/img/fallback-cover.png",
  trackOrigin: null,
  isPrevDisabled: true,
  isNextDisabled: true,

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
  setIsPrevDisabled: (isPrevDisabled) => set({ isPrevDisabled }),
  setIsNextDisabled: (isNextDisabled) => set({ isNextDisabled }),

  setTrackIndex: (index) => {
    const { queue, currentIndex, setCurrentIndex } = get();

    const isValidIndex = index >= 0 && index < queue.length;
    if (isValidIndex && index !== currentIndex) {
      setCurrentIndex(index);
    }
  },

  syncTrackInfo: (track) => {
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

  playTrackAtIndex: (index) => {
    const {
      currentIndex,
      queue,
      syncTrackInfo,
      playTrack,
      setTrackIndex,
      setIsPrevDisabled,
      setIsNextDisabled,
    } = get();

    const track = queue[index];
    console.log(track);
    const isSameTrack = index === currentIndex;
    const isFirstTrackNotPlayed = currentIndex === 0;
    // 同じトラックはスキップすることで再生・停止で切り替えてる
    // indexの初期値がゼロだから、まだ未再生の状態で一番上のトラックを押すと再生できない対策
    if (!track || (isSameTrack && !isFirstTrackNotPlayed)) return;

    syncTrackInfo(track);
    playTrack(track);
    setTrackIndex(index);

    setIsPrevDisabled(index <= 0);
    setIsNextDisabled(index >= queue.length - 1);
  },

  goToNextTrack: () => {
    const { currentIndex, queue, playTrackAtIndex } = get();
    const { playDisable } = usePlayerStore.getState();

    if (playDisable) return;
    const nextIndex = Math.min(currentIndex + 1, queue.length - 1);
    if (nextIndex !== currentIndex) {
      playTrackAtIndex(nextIndex);
    }
  },

  goToPreviousTrack: () => {
    const { currentIndex, playTrackAtIndex } = get();
    const { playDisable } = usePlayerStore.getState();

    if (playDisable) return;
    const prevIndex = Math.max(currentIndex - 1, 0);
    if (prevIndex !== currentIndex) {
      playTrackAtIndex(prevIndex);
    }
  },
}));

export default usePlaybackStore;
