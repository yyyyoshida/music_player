import { useState, useEffect } from "react";
import useBarHandler from "./useBarHandler";
import usePlayerStore from "../store/playerStore";
import { STORAGE_KEYS } from "../utils/storageKeys";

type VolumeBarProps = {
  initialValue: number;
  barRef: React.RefObject<HTMLDivElement | null>;
};

const useVolumeBar = ({ initialValue, barRef }: VolumeBarProps) => {
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem(STORAGE_KEYS.IS_MUTED);
    return savedMute ? JSON.parse(savedMute) : false;
  });
  const audioRef = usePlayerStore((state) => state.audioRef);
  const updateVolume = usePlayerStore.getState().updateVolume;
  const playerReady = usePlayerStore((state) => state.playerReady);

  const { percentage, setPercentage, handleMouseDown } = useBarHandler({
    type: "volume",
    initialValue: initialValue,
    barRef: barRef,
    handleVolumeChange: handleVolumeChange,
  });

  function applyVolume(value: number) {
    if (!audioRef?.current) return;
    const clampValue = Math.max(Math.min(value, 1), 0);

    audioRef.current.volume = clampValue;
    updateVolume(clampValue);
  }

  function handleVolumeChange(newPercentage: number) {
    setPercentage(newPercentage);
    if (!playerReady || isMuted) return;
    applyVolume(newPercentage / 100);
  }

  function toggleMute() {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    const newVolume = nextMuted ? 0 : percentage / 100;
    applyVolume(newVolume);
  }

  useEffect(() => {
    if (!playerReady) return;

    const savedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME);
    const initialVolume = savedVolume ? parseFloat(savedVolume) : 30;

    setPercentage(initialVolume);

    !isMuted ? applyVolume(initialVolume / 100) : applyVolume(0);
  }, [isMuted, playerReady]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOLUME, percentage.toString());
  }, [percentage]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_MUTED, isMuted);
    if (isMuted) localStorage.setItem(STORAGE_KEYS.VOLUME, percentage.toString());
  }, [isMuted]);

  return {
    percentage,
    handleMouseDown,
    toggleMute,
    isMuted,
  };
};

export default useVolumeBar;
