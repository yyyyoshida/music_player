import { createContext, useState, useContext, useEffect, useRef } from "react";
import { useRepeatContext } from "./RepeatContext";
import usePlayerStore from "../store/playerStore";

const PlayerContext = createContext();

export const PlayerProvider = ({ children, isTrackSet, setIsTrackSet }) => {
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const setPosition = usePlayerStore((state) => state.setPosition);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const setTrackId = usePlayerStore((state) => state.setTrackId);
  const isSpotifyPlaying = usePlayerStore((state) => state.isSpotifyPlaying);
  const isLocalPlaying = usePlayerStore((state) => state.isLocalPlaying);
  const audioRef = usePlayerStore((state) => state.audioRef);
  const player = usePlayerStore((state) => state.player);

  const { isRepeat } = useRepeatContext();

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

  return (
    <PlayerContext.Provider
      value={{
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
