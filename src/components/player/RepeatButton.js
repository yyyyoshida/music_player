import { useEffect, useContext } from "react";
import { useRepeatContext } from "../../contexts/RepeatContext";
import { TooltipContext } from "../../contexts/TooltipContext";
import useDelayedText from "../../hooks/useDelayText";
import { repeatOnIcon, repeatOffIcon } from "../../assets/icons";

const RepeatButton = () => {
  const { isRepeat, toggleRepeat } = useRepeatContext();
  useDelayedText(isRepeat, "リピート：オン", "リピート：オフ");

  const {
    handleButtonPress,
    handleMouseEnter,

    handleMouseLeave,
    setTooltipText,
  } = useContext(TooltipContext);

  return (
    <button
      className="player-controls__button player-controls__button--repeat"
      onClick={() => {
        toggleRepeat();
        handleButtonPress();
      }}
      onMouseEnter={(e) => {
        setTooltipText(isRepeat ? "リピート：オン" : "リピート：オフ");
        handleMouseEnter(e);
      }}
      onMouseLeave={() => {
        handleMouseLeave();
      }}
    >
      <img src={isRepeat ? repeatOnIcon : repeatOffIcon} alt="Repeat Icon" width="18" height="18" />
    </button>
  );
};

export default RepeatButton;
