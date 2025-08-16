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

const PlayerContext = createContext();

export const PlayerProvider = ({ children, isTrackSet, setIsTrackSet, queue }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackId, setTrackId] = useState(null);
  const { isRepeat } = useRepeatContext();
  const { token, setToken } = useContext(TokenContext);
  const { showMessage } = useContext(ActionSuccessMessageContext);
  const [isPlayPauseCooldown, setIsPlayPauseCooldown] = useState(false);
  const [isLocalPlaying, setIsLocalPlaying] = useState(false);
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(false);
  const [trackOrigin, setTrackOrigin] = useState(null);
  const [isLocalReady, setIsLocalReady] = useState(false);

  const trackIdRef = useRef(null);
  const audioRef = useRef(null);
  const FADE_DURATION = 3000;

  function loadSpotifyPlayer() {
    return new Promise((resolve, reject) => {
      if (window.Spotify) return resolve(window.Spotify);

      // onSpotifyWebPlaybackSDKReady を先に定義
      window.onSpotifyWebPlaybackSDKReady = () => {
        resolve(window.Spotify);
      };

      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // useEffect 内
  useEffect(() => {
    if (!token) return;

    let playerInstance;

    const setup = async () => {
      try {
        const Spotify = await loadSpotifyPlayer(); // SDKを確実にロード
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

  // }, [isPlaying, currentTitle]);

  const togglePlayPause = (isRepeat) => {
    if (isPlayPauseCooldown) return;

    if (isSpotifyPlaying && player) {
      if (!isRepeat) {
        player.togglePlay().then(() => setIsPlaying((prev) => !prev));

        return;
      }

      if (isPlaying === true) {
        player.resume().then(() => {});
      }

      return;
    }

    if (isLocalPlaying && audioRef.current) {
      const audio = audioRef.current;

      if (audio.paused) {
        audio.play().then(() => setIsPlaying(true));
      } else {
        audio.pause();
        setIsPlaying(false);
      }

      return;
    }
  };

  function handleCanPlay() {
    const audio = audioRef.current;
    if (!audio) return;

    setIsLocalPlaying(true);

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

    if (source === "spotify") {
      playSpotifyTrack(trackUri);
      return;
    }

    if (source === "local") {
      playLocalTrack(trackUri);
    }
  }

  async function playSpotifyTrack(trackUri) {
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
      } else {
        console.error("通信エラー:", error);
        showMessage("networkError");
      }
      // setIsSpotifyPlaying(false);
    }
  }

  function playLocalTrack(trackUri) {
    if (isSpotifyPlaying) {
      player.pause();
      setIsSpotifyPlaying(false);
    }
    if (!audioRef.current) return;

    setIsLocalReady(false);
    setIsLocalPlaying(true);
    const audio = audioRef.current;
    audio.src = trackUri;
    audio.addEventListener("canplay", handleCanPlay);
  }

  function updateVolume(volume) {
    if (!player) return;
    player.setVolume(volume);
  }

  function seekToSpotify(seekTime) {
    if (!player) return;
    player.seek(seekTime);
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
    if (!audioRef.current || !isLocalPlaying) return;

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
        isPlaying,
        setIsPlaying,
        togglePlayPause,
        player,
        playerReady,
        playerTrack,
        updateVolume,
        seekToSpotify,
        duration,
        setDuration,
        position,
        currentTime,
        setCurrentTime,
        formatTime,
        trackId,

        isTrackSet,
        setIsTrackSet,
        isPlayPauseCooldown,

        audioRef,

        isLocalPlaying,

        trackOrigin,
        setTrackOrigin,

        isLocalReady,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
export const usePlayerContext = () => useContext(PlayerContext);
export default PlayerContext;
