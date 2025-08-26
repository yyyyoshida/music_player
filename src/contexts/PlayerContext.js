import { createContext, useState, useContext, useEffect, useRef } from "react";
import { useRepeatContext } from "./RepeatContext";
import { ActionSuccessMessageContext } from "./ActionSuccessMessageContext";
import {
  fetchWithRefresh,
  getNewAccessToken,
  loadSpotifySDK,
  createSpotifyPlayer,
  getOAuthTokenFromStorage,
  connectSpotifyPlayer,
  validateDeviceId,
} from "../utils/spotifyAuth";
import { TokenContext } from "./TokenContext";
import usePlayerStore from "../store/playerStore";

const PlayerContext = createContext();

export const PlayerProvider = ({ children, isTrackSet, setIsTrackSet, queue }) => {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const setPosition = usePlayerStore((state) => state.setPosition);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setPlayDisable = usePlayerStore((state) => state.setPlayDisable);
  const trackId = usePlayerStore((state) => state.trackId);
  const setTrackId = usePlayerStore((state) => state.setTrackId);
  const isSpotifyPlaying = usePlayerStore((state) => state.isSpotifyPlaying);
  const setIsSpotifyPlaying = usePlayerStore((state) => state.setIsSpotifyPlaying);
  const isLocalPlaying = usePlayerStore((state) => state.isLocalPlaying);
  const setIsLocalPlaying = usePlayerStore((state) => state.setIsLocalPlaying);
  const setIsLocalReady = usePlayerStore((state) => state.setIsLocalReady);
  const audioRef = usePlayerStore((state) => state.audioRef);
  const player = usePlayerStore((state) => state.player);
  const setPlayer = usePlayerStore((state) => state.setPlayer);

  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);

  // const [player, setPlayer] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const { isRepeat } = useRepeatContext();
  const { token, setToken } = useContext(TokenContext);
  const { showMessage } = useContext(ActionSuccessMessageContext);
  const [isPlayPauseCooldown, setIsPlayPauseCooldown] = useState(false);
  const [trackOrigin, setTrackOrigin] = useState(null);
  const trackIdRef = useRef(null);
  // const audioRef = useRef(null);
  const TRACK_CHANGE_COOLDOWN = 700;
  const FADE_DURATION = 3000;

  useEffect(() => {
    if (!token) return;

    let playerInstance;

    const setup = async () => {
      try {
        const Spotify = await loadSpotifySDK();
        playerInstance = createSpotifyPlayer({
          getOAuthToken: (cb) => getOAuthTokenFromStorage(cb, setToken),
        });

        playerInstance.addListener("ready", ({ device_id }) => {
          setDeviceId(device_id);
          setPlayerReady(true);
        });

        await playerInstance.connect();
        setPlayer(playerInstance);
      } catch (err) {
        console.error("Spotify Player初期化失敗:", err);
      }
    };

    setup();

    return () => {
      if (playerInstance) playerInstance.disconnect();
    };
  }, [token]);

  useEffect(() => {
    let timeoutId;

    if (!isTrackSet && isPlaying) {
      showMessage("unselected");
      setIsPlayPauseCooldown(true);

      timeoutId = setTimeout(() => {
        setIsPlayPauseCooldown(false);
        togglePlayPause();
      }, FADE_DURATION);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isPlaying, isTrackSet]);

  function handleCanPlay() {
    const audio = audioRef.current;
    if (!audio) return;

    setIsLocalPlaying(true);
    setPlayDisable(false);

    audio
      .play()

      .then(() => {
        setIsPlaying(true);

        setIsLocalReady(true);
      });

    audio.removeEventListener("canplay", handleCanPlay);
  }

  function playerTrack(trackUri, source = "spotify") {
    setIsPlayPauseCooldown(false);
    setPlayDisable(true);

    if (source === "spotify") {
      playSpotifyTrack(trackUri);
      return;
    }

    if (source === "local") {
      playLocalTrack(trackUri);
    }
  }

  async function playSpotifyTrack(trackUri) {
    // 再生時にデバイスIDが切れてても再取得してエラー落ちを防ぐため
    const validDeviceId = await validateDeviceId(deviceId, player, setDeviceId);
    if (!validDeviceId) {
      console.error("有効なデバイスIDが取得できない");
      showMessage("deviceNotFound");
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
      await fetchWithRefresh(`https://api.spotify.com/v1/me/player/play?device_id=${validDeviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      setIsPlaying(true);
    } catch (error) {
      if (error.message === "TOKEN_REFRESH_FAILED") {
        console.error("トークン再取得失敗");
        showMessage("tokenExpired");
        return;
      }

      console.error("通信エラー:", error);
      showMessage("networkError");
    } finally {
      // Spotify限定で429エラーを防ぐために遅延
      setTimeout(resetSpotifyPlayerState, TRACK_CHANGE_COOLDOWN);
    }
  }

  async function resetSpotifyPlayerState() {
    // 曲切り替え中もSpotify曲は再生し続けるため、クールダウンが終わった時に
    // バーが少し進んだ状態になるのを防ぐ↓
    setPosition(0);
    await seekToSpotify(0);

    // 曲切り替え時に一瞬前の曲の冒頭再生を防ぐため、一時的に音量を0にして復元↓
    const savedVolume = parseFloat(localStorage.getItem("player_volume")) || 30;
    const clampedVolume = clampVolume(savedVolume);
    await updateVolume(clampedVolume);

    setPlayDisable(false);
  }

  function clampVolume(volume) {
    return Math.max(Math.min(volume / 100, 1), 0);
  }

  function playLocalTrack(trackUri) {
    if (isSpotifyPlaying) {
      player.pause();
      setIsSpotifyPlaying(false);
    }

    if (!audioRef.current) return;

    setIsLocalReady(false);

    const audio = audioRef.current;
    audio.src = trackUri;
    audio.addEventListener("canplay", handleCanPlay);
  }

  async function updateVolume(volume) {
    if (!player) return;
    await player.setVolume(volume);
  }

  async function seekToSpotify(seekTime) {
    if (!player) return;
    await player.seek(seekTime);
  }

  useEffect(() => {
    trackIdRef.current = trackId;
  }, [trackId]);

  useEffect(() => {
    if (!player || !isSpotifyPlaying) return;

    player.addListener("player_state_changed", (state) => {
      if (!state || !state.track_window?.current_track) return;

      const {
        position,
        duration,
        track_window: { current_track },
        paused,
      } = state;

      setPosition((position / duration) * 100);
      setDuration(duration);
      setTrackId(current_track.id);
    });

    const interval = setInterval(() => {
      player.getCurrentState().then((state) => {
        if (!state) return;

        const { position, duration } = state;

        if (typeof position === "number" && typeof duration === "number") {
          setPosition((position / duration) * 100);
          setCurrentTime(position);
        }
      });
    }, 200);

    return () => {
      clearInterval(interval);
      player.removeListener("player_state_changed");
    };
  }, [player, isRepeat, isSpotifyPlaying]);

  useEffect(() => {
    if (!audioRef?.current || !isLocalPlaying) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (!audio.duration || isNaN(audio.duration)) return;

      setCurrentTime(audio.currentTime * 1000);
      setPosition((audio.currentTime / audio.duration) * 100);
      setDuration(audio.duration * 1000);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [isLocalPlaying]);

  function formatTime(time) {
    // useMemoとかで無駄な再レンダリングを回避しろ
    const MS_MINUTE = 60000; // １分
    const MS_SECOND = 1000; // １秒

    const minutes = Math.floor(time / MS_MINUTE);
    const seconds = Math.floor((time % MS_MINUTE) / MS_SECOND);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  return (
    <PlayerContext.Provider
      value={{
        playerReady,
        playerTrack,
        updateVolume,
        seekToSpotify,
        formatTime,

        isTrackSet,
        setIsTrackSet,
        isPlayPauseCooldown,

        trackOrigin,
        setTrackOrigin,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
export const usePlayerContext = () => useContext(PlayerContext);
export default PlayerContext;
