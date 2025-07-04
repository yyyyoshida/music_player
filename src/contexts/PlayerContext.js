import { createContext, useState, useContext, useEffect, useRef } from "react";
import { useRepeatContext } from "./RepeatContext";
import { ActionSuccessMessageContext } from "./ActionSuccessMessageContext";

const PlayerContext = createContext();

export const PlayerProvider = ({ children, token, isTrackSet, setIsTrackSet, queue }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackId, setTrackId] = useState(null);
  const { isRepeat } = useRepeatContext();
  const { showMessage } = useContext(ActionSuccessMessageContext);
  const [isPlayPauseCooldown, setIsPlayPauseCooldown] = useState(false);
  const [isLocalPlaying, setIsLocalPlaying] = useState(false);
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(false);
  const [trackOrigin, setTrackOrigin] = useState(null);

  const trackIdRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    // スクリプトのエラーチェック
    script.onerror = () => {
      console.error("Spotify SDK の読み込みに失敗しました。");
    };

    document.body.appendChild(script);

    // Spotify SDKの初期化
    window.onSpotifyWebPlaybackSDKReady = () => {
      const playerInstance = new window.Spotify.Player({
        name: "MyMusicPlayer",
        getOAuthToken: (cb) => {
          if (token) {
            cb(token);
          } else {
            console.error("トークンが未設定です");
          }
        },
        volume: 0.3,
      });

      playerInstance.addListener("ready", ({ device_id }) => {
        if (device_id) {
          console.log("🎵 Player is ready! Device ID:", device_id);
          setDeviceId(device_id);
          setPlayerReady(true);
        } else {
          console.error("Device ID is missing");
        }
      });

      playerInstance.addListener("player_state_changed", (state) => {
        if (state) {
          setIsPlaying(!state.paused);
        } else {
          console.error("状態が取得できませんでした");
        }
      });

      playerInstance
        .connect()
        .then(() => {
          console.log("プレイヤー接続成功");
        })
        .catch((err) => {
          console.error("接続エラー:", err);
        });

      setPlayer(playerInstance);
    };

    return () => {
      if (player) {
        player.disconnect();
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

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.error("再生失敗", err);
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

    fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
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

    setIsLocalPlaying(true);
    const audio = audioRef.current;
    audio.src = trackUri;
    audio.addEventListener("canplay", handleCanPlay);
  }

  function playerTrack(trackUri, source = "spotify") {
    // console.log(trackUri, "trackUri");

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

    player.addListener("player_state_changed", ({ position, duration, track_window: { current_track }, paused }) => {
      setPosition((position / duration) * 100);
      setDuration(duration);
      setTrackId(current_track.id);
    });

    const interval = setInterval(() => {
      player.getCurrentState().then((state) => {
        if (!state) return;

        setPosition((state.position / state.duration) * 100);
        setCurrentTime(state.position);
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
        position,
        currentTime,
        formatTime,
        token,
        trackId,

        isTrackSet,
        setIsTrackSet,
        isPlayPauseCooldown,

        audioRef,

        isLocalPlaying,

        trackOrigin,
        setTrackOrigin,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
export const usePlayerContext = () => useContext(PlayerContext);
