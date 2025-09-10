import usePlayerStore from "../../store/playerStore";
import useTooltipStore from "../../store/tooltipStore";

import useDelayedText from "../../hooks/useDelayText";
import { playIcon, pauseIcon } from "../../assets/icons";

const PlayButton = () => {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const isPlayPauseCooldown = usePlayerStore((state) => state.isPlayPauseCooldown);

  const setTooltipText = useTooltipStore((state) => state.setTooltipText);
  const handleButtonPress = useTooltipStore((state) => state.handleButtonPress);
  const handleMouseEnter = useTooltipStore((state) => state.handleMouseEnter);
  const handleMouseLeave = useTooltipStore((state) => state.handleMouseLeave);

  useDelayedText(isPlaying, "一時停止", "再生");

  function handlePlayPause() {
    if (isPlayPauseCooldown) return;
    togglePlayPause();
    handleButtonPress();
  }

  function handlePlayPauseMouseEnter(e) {
    setTooltipText(isPlaying ? "一時停止" : "再生");
    handleMouseEnter(e);
  }

  return (
    <button
      onClick={handlePlayPause}
      className="player-controls__button player-controls__play-pause-button"
      onMouseEnter={handlePlayPauseMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={isPlaying ? pauseIcon : playIcon}
        className={`player-controls__play-pause-button-icon player-controls__${isPlaying ? "pause" : "play"}-icon`}
      />
    </button>
  );
};
export default PlayButton;
