import { createContext, useState, useContext, useEffect, useRef } from "react";
import { useRepeatContext } from "./RepeatContext";
import { ActionSuccessMessageContext } from "./ActionSuccessMessageContext";
import Playlist from "../components/playlists/Playlist";

const PlayerContext = createContext();

export const PlayerProvider = ({ children, token, isTrackSet, setIsTrackSet }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [player, setPlayer] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackImage, setTrackImage] = useState("img/not-found.jpg");
  const [trackTitle, setTrackTitle] = useState("曲のタイトル");
  const [trackArtistName, setTrackArtistName] = useState("アーティスト・作者名");
  const [trackId, setTrackId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const { isRepeat } = useRepeatContext();
  const { showMessage } = useContext(ActionSuccessMessageContext);
  const [isPlayPauseCooldown, setIsPlayPauseCooldown] = useState(false);
  const [currentAudioURL, setCurrentAudioURL] = useState(null);
  const [isLocalPlaying, setIsLocalPlaying] = useState(false);
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(false);

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
  }, [isPlaying, trackTitle]);

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

  function playSpotifyTrack(trackUri, isClickedTrack) {
    if (!deviceId) {
      console.error("❌ デバイスIDなし");
      return;
    }

    if (isClickedTrack) {
      togglePlayPause();
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

    fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.ok && setIsPlaying(true));

    setIsSpotifyPlaying(true);
  }

  function playLocalTrack(trackUri) {
    if (isSpotifyPlaying) {
      player.pause();
      setIsSpotifyPlaying(false);
    }
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.src = trackUri;
    audio.addEventListener("canplay", handleCanPlay);
    setIsLocalPlaying(true);
  }

  function playerTrack(trackUri, isClickedTrack, source = "spotify") {
    console.log("playerTrack発動！！");
    setIsPlayPauseCooldown(false);

    if (source === "spotify") {
      playSpotifyTrack(trackUri, isClickedTrack);
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

  function seekTo(seekTime) {
    if (!player) return;
    player.seek(seekTime);
  }

  useEffect(() => {
    if (!player || !isSpotifyPlaying) return;

    player.addListener("player_state_changed", ({ position, duration, track_window: { current_track }, paused }) => {
      setPosition((position / duration) * 100);
      setDuration(duration);
      setTrackImage(current_track.album.images[0].url);
      setTrackTitle(current_track.name);
      setTrackArtistName(current_track.artists[0].name);
      setTrackId(current_track.id);
      setIsStreaming(!paused);
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
        currentSongIndex,
        player,
        playerReady,
        playerTrack,
        updateVolume,
        seekTo,
        duration,
        position,
        currentTime,
        formatTime,
        trackImage,
        trackTitle,
        trackArtistName,
        token,
        trackId,
        isStreaming,

        isTrackSet,
        setIsTrackSet,
        isPlayPauseCooldown,

        audioRef,
        currentAudioURL,
        setCurrentAudioURL,
        isLocalPlaying,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
export const usePlayerContext = () => useContext(PlayerContext);
