import { useContext, useEffect, useState } from "react";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { TooltipContext } from "../../contexts/TooltipContext";

import useDelayedText from "../../hooks/useDelayText";
import { playIcon, pauseIcon } from "../../assets/icons";

const PlayButton = () => {
  const { isPlayPauseCooldown, isPlaying, togglePlayPause } = usePlayerContext();
  const { handleButtonPress, handleMouseEnter, handleMouseLeave, setTooltipText } = useContext(TooltipContext);
  useDelayedText(isPlaying, "一時停止", "再生");

  function handlePlayPause() {
    if (isPlayPauseCooldown) return;
    togglePlayPause();
    handleButtonPress();
  }

  return (
    <button
      onClick={handlePlayPause}
      className="player-controls__button player-controls__play-pause-button"
      onMouseEnter={(e) => {
        setTooltipText(isPlaying ? "一時停止" : "再生");
        handleMouseEnter(e);
      }}
      onMouseLeave={() => {
        handleMouseLeave();
      }}
    >
      <img
        src={isPlaying ? pauseIcon : playIcon}
        className={`player-controls__play-pause-button-icon player-controls__${isPlaying ? "pause" : "play"}-icon`}
      ></img>
    </button>
  );
};
export default PlayButton;
