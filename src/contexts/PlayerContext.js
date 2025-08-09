import { createContext, useState, useContext, useEffect, useRef } from "react";
import { useRepeatContext } from "./RepeatContext";
import { ActionSuccessMessageContext } from "./ActionSuccessMessageContext";
import { fetchWithRefresh, getNewAccessToken } from "../utils/spotifyAuth";
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
  const { token, isToken, setToken } = useContext(TokenContext);
  const { showMessage } = useContext(ActionSuccessMessageContext);
  const [isPlayPauseCooldown, setIsPlayPauseCooldown] = useState(false);
  const [isLocalPlaying, setIsLocalPlaying] = useState(false);
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(false);
  const [trackOrigin, setTrackOrigin] = useState(null);
  const [isLocalReady, setIsLocalReady] = useState(false);

  const trackIdRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    if (window.Spotify) return; // 2回読み込み防止

    let playerInstance;

    window.onSpotifyWebPlaybackSDKReady = () => {
      playerInstance = new window.Spotify.Player({
        name: "MyMusicPlayer",

        getOAuthToken: async (cb) => {
          const currentToken = localStorage.getItem("access_token");
          const localRefreshToken = localStorage.getItem("refresh_token");

          if (currentToken) {
            cb(currentToken);
            return;
          }

          if (!localRefreshToken) {
            console.error("リフレッシュトークンがないよ");
            cb(""); // トークンなしは空文字投げとく
            return;
          }

          try {
            const newToken = await getNewAccessToken(localRefreshToken);
            localStorage.setItem("access_token", newToken);
            setToken(newToken); // これが必要ならOKだけど無理にしなくてもいい
            cb(newToken);
          } catch (err) {
            console.error("❌ getOAuthToken失敗:", err);
            cb("");
          }
        },
        volume: 0.3,
      });

      playerInstance.addListener("initialization_error", ({ message }) => {
        console.error("❌ Initialization error:", message);
      });
      playerInstance.addListener("authentication_error", ({ message }) => {
        console.error("❌ Authentication error:", message);
      });
      playerInstance.addListener("account_error", ({ message }) => {
        console.error("❌ Account error:", message);
      });

      // イベント登録
      playerInstance.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
        setPlayerReady(true);
      });

      playerInstance
        .connect()
        .then(() => {})
        .catch((err) => {
          console.error("接続エラー:", err);
        });

      setPlayer(playerInstance);
    };

    // そのあと script 読み込みｓ
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onerror = () => {
      console.error("Spotify SDK の読み込みに失敗しました。");
    };
    document.body.appendChild(script);

    return () => {
      if (playerInstance) {
        playerInstance.disconnect();
      }
    };
  }, [token]);

  const FADE_DURATION = 3000;

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

  function playSpotifyTrack(trackUri) {
    if (!deviceId) {
      console.error("❌ デバイスIDなし");
      return;
    }

    if (isLocalPlaying) {
      audioRef.current.pause();
      setIsLocalPlaying(false);
    }

    const url = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;
    const data = {
      uris: [trackUri],
      offset: { position: 0 },
      position_ms: 0,
    };

    setIsSpotifyPlaying(true);

    fetchWithRefresh(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (res.ok) {
          setIsPlaying(true);
        } else {
          console.warn("再生リクエスト失敗:", res.status);
          setIsSpotifyPlaying(false);
        }
      })
      .catch((err) => {
        console.error("通信エラー:", err);
        setIsSpotifyPlaying(false);
      });
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
        // token,
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
