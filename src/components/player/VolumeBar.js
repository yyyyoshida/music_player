import { useState, useEffect, useRef } from "react";
import { usePlayerContext } from "../../contexts/PlayerContext";
import useButtonTooltip from "../../hooks/useButtonTooltip";
import useDelayedText from "../../hooks/useDelayText";
import useBarHandler from "../../hooks/useBarHandler";
import Tooltip from "../Tooltip";
import VolumeIcon from "./VolumeIcon";

const VolumeBar = ({ initialValue }) => {
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem("isMuted");
    return savedMute ? JSON.parse(savedMute) : false;
  });

  const barRef = useRef(null);

  const { playerReady, updateVolume, audioRef } = usePlayerContext();

  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();
  const tooltipText = useDelayedText("ミュート解除", "ミュート", isMuted, isMuted);
  const { percentage, setPercentage, handleMouseDown } = useBarHandler({
    type: "volume",
    value: initialValue,
    barRef: barRef,
    handleVolumeChange: handleVolumeChange,
  });

  function applyVolume(value) {
    if (!audioRef?.current) return;
    audioRef.current.volume = value;
    updateVolume(value);
  }

  function handleVolumeChange(newPercentage) {
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
    localStorage.setItem("player_volume", percentage);
  }, [percentage]);

  useEffect(() => {
    localStorage.setItem("isMuted", isMuted);
    if (isMuted) localStorage.setItem("player_volume", percentage);
  }, [isMuted]);

  return (
    <>
      <button
        className="player-controls__button player-controls__button--volume"
        onClick={toggleMute}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <VolumeIcon volume={percentage} isMuted={isMuted} />

        <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={"tooltip-volume"}>
          {tooltipText}
        </Tooltip>
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
