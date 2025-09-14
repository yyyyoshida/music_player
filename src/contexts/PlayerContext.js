import { createContext, useState, useContext, useEffect, useRef } from "react";
// import { useRepeatContext } from "./RepeatContext";
import usePlayerStore from "../store/playerStore";

const PlayerContext = createContext();

export const PlayerProvider = ({ children, isTrackSet, setIsTrackSet }) => {
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const setPosition = usePlayerStore((state) => state.setPosition);
  const setDuration = usePlayerStore((state) => state.setDuration);

  const isLocalPlaying = usePlayerStore((state) => state.isLocalPlaying);
  const audioRef = usePlayerStore((state) => state.audioRef);

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
