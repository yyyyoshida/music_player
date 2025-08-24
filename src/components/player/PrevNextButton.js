import { useState, useContext } from "react";
import useTooltipStore from "../../store/tooltipStore";
import { PlaybackContext } from "../../contexts/PlaybackContext";
import { TooltipContext } from "../../contexts/TooltipContext";

const PrevNextButton = ({ type }) => {
  const CLICK_DELAY = 350;
  const [isClickable, setIsClickable] = useState(true);
  const setTooltipText = useTooltipStore((state) => state.setTooltipText);
  const { goToPreviousTrack, goToNextTrack, isPrevDisabled, isNextDisabled } = useContext(PlaybackContext);
  const { handleButtonPress, handleMouseEnter, handleMouseLeave } = useContext(TooltipContext);

  function handlePrevNextClick() {
    if ((type === "prev" && isPrevDisabled) || (type === "next" && isNextDisabled)) return;
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
    }, CLICK_DELAY);
  }

  return (
    <button
      className={`player-controls__button ${type === "next" ? "next-button" : "prev-button"} ${type === "next" && isNextDisabled ? "disabled" : ""} ${type === "prev" && isPrevDisabled ? "disabled" : ""}`}
      onClick={handlePrevNextClick}
      onMouseEnter={(e) => {
        setTooltipText(type === "next" ? "次へ" : "前へ");
        handleMouseEnter(e);
      }}
      onMouseLeave={() => {
        handleMouseLeave();
      }}
    >
      {type === "next" && <img src="/img/next-icon.png" alt="Next" />}
      {type === "prev" && <img src="/img/prev-icon.png" alt="Previous" />}
    </button>
  );
};

export default PrevNextButton;
