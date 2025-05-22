import { useState, useContext } from "react";
import { usePlayerContext } from "../contexts/PlayerContext";
import Tooltip from "./Tooltip";
import useButtonTooltip from "../hooks/useButtonTooltip";
import { PlaybackContext } from "../contexts/PlaybackContext";
// import { SearchContext } from "../components/SearchContext";

const PrevNextButton = ({ type }) => {
  const { goToPreviousTrack, goToNextTrack, isPrevDisabled, isNextDisabled } = useContext(PlaybackContext);
  const { isPlaying } = usePlayerContext();
  const [isClickable, setIsClickable] = useState(true);
  // const { isTrackSet, setIsTrackSet } = useContext(SearchContext);

  const clickDelay = 350;
  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();

  function handlePrevNextClick() {
    if (!isClickable) return;

    handleButtonPress();
    setIsClickable(false);

    if (type === "prev") {
      goToPreviousTrack();
    } else {
      goToNextTrack();
    }

    setTimeout(() => {
      setIsClickable(true);
    }, clickDelay);
  }

  return (
    <button
      className={`player-controls__button ${type === "next" ? "next-button" : "prev-button"} ${type === "next" && isNextDisabled ? "disabled" : ""} ${type === "prev" && isPrevDisabled ? "disabled" : ""}`}
      onClick={handlePrevNextClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {type === "next" && <img src="/img/next-icon.png" alt="Next" />}
      {type === "prev" && <img src="/img/prev-icon.png" alt="Previous" />}

      <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={type === "next" ? "tooltip-next" : "tooltip-prev"}>
        {type === "next" ? "次へ" : "前へ"}
      </Tooltip>
    </button>
  );
};

export default PrevNextButton;
