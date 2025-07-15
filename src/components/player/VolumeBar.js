import { useState, useEffect, useRef, useContext } from "react";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { TooltipContext } from "../../contexts/TooltipContext";
import useDelayedText from "../../hooks/useDelayText";
import useBarHandler from "../../hooks/useBarHandler";
import VolumeIcon from "./VolumeIcon";

const VolumeBar = ({ initialValue }) => {
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem("isMuted");
    return savedMute ? JSON.parse(savedMute) : false;
  });

  const barRef = useRef(null);

  useDelayedText(isMuted, "ミュート：解除", "ミュート");
  const {
    handleButtonPress,
    handleMouseEnter,

    handleMouseLeave,

    setTooltipText,
  } = useContext(TooltipContext);

  const { playerReady, updateVolume, audioRef } = usePlayerContext();

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
        onMouseEnter={(e) => {
          setTooltipText(isMuted ? "ミュート：解除" : "ミュート");
          handleMouseEnter(e);
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
