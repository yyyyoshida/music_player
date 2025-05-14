import React, { createContext, useState, useContext, useEffect } from "react";
import { useRepeatContext } from "./RepeatContext";
import { ActionSuccessMessageContext } from "../contexts/ActionSuccessMessageContext";

const PlayerContext = createContext();

export const PlayerProvider = ({ children, token, isTrackSet, setIsTrackSet }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [player, setPlayer] = useState(null);
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

    if (!player) {
      alert("Player is not initialized yer!");
      return;
    }

    if (player && !isRepeat) {
      player.togglePlay().then(() => {
        setIsPlaying((prev) => !prev);
        // startCooldown();
      });
      return;
    }

    if (player && isRepeat && isPlaying === true) {
      player.resume().then(() => {});
    }
  };

  function playerTrack(trackUri, isClickedTrack) {
    console.log("playerTrack発動！！");

    if (!deviceId) {
      console.error("❌ デバイス ID が取得できてない！");
      console.log(deviceId);
      return;
    }

    if (isClickedTrack) {
      togglePlayPause();
      return;
    }

    const url = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;
    const data = {
      uris: [trackUri],
      offset: {
        position: 0,
      },
      position_ms: 0,
    };

    fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.ok && setIsPlaying(true)); // 成功時にだけ setIsPlaying(true)

    // // .then((response) => response.json())
    // .then((data) => console.log('再生結果:', data)) // 再生結果をログに表示
    // .catch((error) => console.error('❌ 再生エラー:', error));
    console.log("すみません。この２種類のエラーだけは解決できませんでした。");
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
    if (!player) return;

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
  }, [player, isRepeat]);

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
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
export const usePlayerContext = () => useContext(PlayerContext);
