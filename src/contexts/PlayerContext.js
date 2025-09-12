import { createContext, useState, useContext, useEffect, useRef } from "react";
import { useRepeatContext } from "./RepeatContext";
import { getNewAccessToken, loadSpotifySDK, createSpotifyPlayer, getOAuthTokenFromStorage, connectSpotifyPlayer } from "../utils/spotifyAuth";
import useTokenStore from "../store/tokenStore";
import usePlayerStore from "../store/playerStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";

const PlayerContext = createContext();

export const PlayerProvider = ({ children, isTrackSet, setIsTrackSet, queue }) => {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const setPosition = usePlayerStore((state) => state.setPosition);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setTrackId = usePlayerStore((state) => state.setTrackId);
  const isSpotifyPlaying = usePlayerStore((state) => state.isSpotifyPlaying);
  const isLocalPlaying = usePlayerStore((state) => state.isLocalPlaying);
  const audioRef = usePlayerStore((state) => state.audioRef);
  const player = usePlayerStore((state) => state.player);
  const setPlayer = usePlayerStore((state) => state.setPlayer);
  const setIsPlayPauseCooldown = usePlayerStore((state) => state.setIsPlayPauseCooldown);
  const setDeviceId = usePlayerStore((state) => state.setDeviceId);
  const setPlayerReady = usePlayerStore((state) => state.setPlayerReady);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);

  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

  const { isRepeat } = useRepeatContext();
  const setToken = useTokenStore((state) => state.setToken);
  const token = useTokenStore((state) => state.token);
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
    // }, [token]);
  }, []);

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
        formatTime,

        isTrackSet,
        setIsTrackSet,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
export const usePlayerContext = () => useContext(PlayerContext);
export default PlayerContext;
