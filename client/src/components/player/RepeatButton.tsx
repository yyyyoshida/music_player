import useTooltipStore from "../../store/tooltipStore";
import useRepeatStore from "../../store/repeatStore";
import useDelayedText from "../../hooks/useDelayText";
import { repeatOnIcon, repeatOffIcon } from "../../assets/icons";

const RepeatButton = () => {
  const { setTooltipText, handleButtonPress, handleMouseEnter, handleMouseLeave } = useTooltipStore.getState();

  const isRepeat = useRepeatStore((state) => state.isRepeat);
  const { toggleRepeat } = useRepeatStore.getState();

  useDelayedText(isRepeat, "リピート：オン", "リピート：オフ");

  return (
    <button
      className="player-controls__button player-controls__button--repeat"
      onClick={() => {
        toggleRepeat();
        handleButtonPress();
      }}
      onMouseEnter={() => {
        setTooltipText(isRepeat ? "リピート：オン" : "リピート：オフ");
        handleMouseEnter();
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
