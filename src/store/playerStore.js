import { create } from "zustand";
import { validateDeviceId, fetchSpotifyAPI, initSpotifyPlayer } from "../utils/spotifyAuth";
import useTokenStore from "./tokenStore";

const usePlayerStore = create((set, get) => ({
  TRACK_CHANGE_COOLDOWN: 700,

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
  isPlayPauseCooldown: false,
  deviceId: null,
  playerReady: false,

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
  setIsPlayPauseCooldown: (isPlayPauseCooldown) => set({ isPlayPauseCooldown }),
  setDeviceId: (deviceId) => set({ deviceId }),
  setPlayerReady: (playerReady) => set({ playerReady }),

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

  playerTrack: async (trackUri, source = "spotify") => {
    const { setPlayDisable, setIsPlayPauseCooldown, playSpotifyTrack, playLocalTrack } = get();

    setIsPlayPauseCooldown(false);
    setPlayDisable(true);

    if (source === "spotify") {
      playSpotifyTrack(trackUri);
      return;
    }

    if (source === "local") {
      playLocalTrack(trackUri);
    }
  },

  playSpotifyTrack: async (trackUri) => {
    const {
      deviceId,
      player,
      setPlayer,
      setDeviceId,
      isLocalPlaying,
      setIsLocalPlaying,
      audioRef,
      setIsSpotifyPlaying,
      setIsPlaying,
      resetSpotifyPlayerState,
      TRACK_CHANGE_COOLDOWN,
    } = get();
    const { setToken } = useTokenStore.getState();
    // 再生時にデバイスIDが切れてても再取得してエラー落ちを防ぐため ↓
    const validDeviceId = await validateDeviceId(deviceId, setPlayer, setDeviceId, setToken);

    if (!validDeviceId) {
      console.error("有効なデバイスIDが取得できない");
      // showMessage("deviceNotFound");
      // 今後ActionMessageContextをZustandに移行してそこからshowMessage()を使う
      return;
    }

    if (isLocalPlaying) {
      audioRef.current.pause();
      setIsLocalPlaying(false);
    }

    const data = {
      uris: [trackUri],
      offset: { position: 0 },
      position_ms: 0,
    };

    setIsSpotifyPlaying(true);

    try {
      await fetchSpotifyAPI(`https://api.spotify.com/v1/me/player/play?device_id=${validDeviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      setIsPlaying(true);
    } catch (error) {
      if (error.message === "TOKEN_REFRESH_FAILED") {
        console.error("トークン再取得失敗");
        // showMessage("tokenExpired");
        // 今後ActionMessageContextをZustandに移行してそこからshowMessage()を使う
        return;
      }

      console.error("通信エラー:", error);
      // showMessage("networkError");
      // 今後ActionMessageContextをZustandに移行してそこからshowMessage()を使う
    } finally {
      // Spotify限定で429エラーを防ぐために遅延
      setTimeout(resetSpotifyPlayerState, TRACK_CHANGE_COOLDOWN);
    }
  },

  resetSpotifyPlayerState: async () => {
    // 曲切り替え中もSpotify曲は再生し続けるため、クールダウンが終わった時に
    // バーが少し進んだ状態になるのを防ぐ↓
    const { setPosition, player, setPlayDisable, clampVolume, updateVolume } = get();

    setPosition(0);
    // await seekToSpotify(0);
    if (!player) return;
    await player.seek(0);

    const savedVolume = parseFloat(localStorage.getItem("player_volume")) || 30;
    const clampedVolume = clampVolume(savedVolume);
    await player.setVolume(clampedVolume);
    // await updateVolume(clampedVolume);

    setPlayDisable(false);
  },

  clampVolume: (volume) => {
    return Math.max(Math.min(volume / 100, 1), 0);
  },

  playLocalTrack: (trackUri) => {
    const { isSpotifyPlaying, setIsSpotifyPlaying, player, setIsLocalReady, audioRef, handleLocalCanPlay } = get();

    if (isSpotifyPlaying) {
      player.pause();
      setIsSpotifyPlaying(false);
    }

    if (!audioRef.current) return;

    setIsLocalReady(false);

    const audio = audioRef.current;
    audio.removeEventListener("canplay", handleLocalCanPlay);
    audio.src = trackUri;
    audio.addEventListener("canplay", handleLocalCanPlay, { once: true });
  },

  handleLocalCanPlay: () => {
    const { audioRef, setIsLocalPlaying, setPlayDisable, setIsPlaying, setIsLocalReady } = get();

    if (!audioRef.current) return;

    setIsLocalPlaying(true);
    setPlayDisable(false);

    audioRef.current
      .play()

      .then(() => {
        setIsPlaying(true);

        setIsLocalReady(true);
      });
  },

  updateVolume: async (volume) => {
    const { player } = get();

    if (!player) return;
    await player.setVolume(volume);
  },

  seekToSpotify: async (seekTime) => {
    const { player } = get();

    if (!player) return;
    await player.seek(seekTime);
  },

  initPlayer: async () => {
    const { setPlayer, setDeviceId } = get();
    const { setToken } = useTokenStore.getState();

    try {
      const { playerInstance } = await initSpotifyPlayer(setPlayer, setDeviceId, setToken);
      set({ playerReady: true });
      return playerInstance;
    } catch (error) {
      console.error("Spotify Player初期化失敗:", error);
      throw error;
    }
  },
}));

export default usePlayerStore;
