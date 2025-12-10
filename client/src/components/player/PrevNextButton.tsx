import { useState } from "react";
import useTooltipStore from "../../store/tooltipStore";
import usePlaybackStore from "../../store/playbackStore";

type PrevNextButtonProps = {
  type: "prev" | "next";
};

const PrevNextButton = ({ type }: PrevNextButtonProps) => {
  const CLICK_DELAY = 350;
  const [isClickable, setIsClickable] = useState(true);
  const { setTooltipText, handleButtonPress, handleMouseEnter, handleMouseLeave } = useTooltipStore.getState();
  const { goToNextTrack, goToPreviousTrack } = usePlaybackStore.getState();
  const isPrevDisabled = usePlaybackStore((state) => state.isPrevDisabled);
  const isNextDisabled = usePlaybackStore((state) => state.isNextDisabled);

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
      onMouseEnter={() => {
        setTooltipText(type === "next" ? "次へ" : "前へ");
        handleMouseEnter();
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
