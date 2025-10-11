import { useState, useEffect, useRef } from "react";
import useDelayedText from "../../hooks/useDelayText";
import useBarHandler from "../../hooks/useBarHandler";
import VolumeIcon from "./VolumeIcon";
import useTooltipStore from "../../store/tooltipStore";
import usePlayerStore from "../../store/playerStore";

type VolumeBarProps = {
  initialValue: number;
};

const VolumeBar = ({ initialValue }: VolumeBarProps) => {
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem("isMuted");
    return savedMute ? JSON.parse(savedMute) : false;
  });
  const barRef = useRef<HTMLDivElement | null>(null);
  useDelayedText(isMuted, "ミュート：解除", "ミュート");
  const audioRef = usePlayerStore((state) => state.audioRef);
  const updateVolume = usePlayerStore((state) => state.updateVolume);
  const playerReady = usePlayerStore((state) => state.playerReady);
  const setTooltipText = useTooltipStore((state) => state.setTooltipText);

  const handleButtonPress = useTooltipStore((state) => state.handleButtonPress);
  const handleMouseEnter = useTooltipStore((state) => state.handleMouseEnter);
  const handleMouseLeave = useTooltipStore((state) => state.handleMouseLeave);
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
    handleButtonPress();

    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    const newVolume = nextMuted ? 0 : percentage / 100;
    applyVolume(newVolume);
  }

  useEffect(() => {
    if (!playerReady) return;

    const savedVolume = localStorage.getItem("player_volume");
    const initialVolume = savedVolume ? parseFloat(savedVolume) : 30;

    setPercentage(initialVolume);

    !isMuted ? applyVolume(initialVolume / 100) : applyVolume(0);
  }, [isMuted, playerReady]);

  useEffect(() => {
    localStorage.setItem("player_volume", percentage.toString());
  }, [percentage]);

  useEffect(() => {
    localStorage.setItem("isMuted", isMuted);
    if (isMuted) localStorage.setItem("player_volume", percentage.toString());
  }, [isMuted]);

  return (
    <>
      <button
        className="player-controls__button player-controls__button--volume"
        onClick={toggleMute}
        onMouseEnter={() => {
          setTooltipText(isMuted ? "ミュート：解除" : "ミュート");
          handleMouseEnter();
        }}
        onMouseLeave={() => {
          handleMouseLeave();
        }}
      >
        <VolumeIcon volume={percentage} isMuted={isMuted} />
      </button>
      <div ref={barRef} className="player-controls__volume-bar--wrapper" onMouseDown={handleMouseDown}>
        <div className="player-controls__volume-bar">
          <div className="player-controls__volume-fill" style={{ width: `${percentage}%` }}>
            <div className="player-controls__volume-thumb" style={{ left: `${percentage}%` }}></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VolumeBar;
