import { usePlayerContext } from "../../contexts/PlayerContext";
import Tooltip from "../Tooltip";
import useButtonTooltip from "../../hooks/useButtonTooltip";
import useDelayedText from "../../hooks/useDelayText";
import { playIcon, pauseIcon } from "../../assets/icons";

const PlayButton = () => {
  const { isPlayPauseCooldown, isPlaying, togglePlayPause, currentSongIndex, isClassName, setIsClassName } = usePlayerContext();
  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();
  const tooltipText = useDelayedText("一時停止", "再生", isPlaying, isPlaying, 0);

  function handlePlayPause() {
    if (isPlayPauseCooldown) return;
    togglePlayPause();
    handleButtonPress();
  }

  return (
    <button
      onClick={handlePlayPause}
      className="player-controls__button player-controls__play-pause-button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={isPlaying ? pauseIcon : playIcon}
        className={`player-controls__play-pause-button-icon player-controls__${isPlaying ? "pause" : "play"}-icon`}
      ></img>
      <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={isPlaying ? "tooltip-pause" : "tooltip-play"}>
        {tooltipText}
      </Tooltip>
    </button>
  );
};
export default PlayButton;
