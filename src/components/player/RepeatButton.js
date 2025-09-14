import useTooltipStore from "../../store/tooltipStore";
import useRepeatStore from "../../store/repeatStore";
import useDelayedText from "../../hooks/useDelayText";
import { repeatOnIcon, repeatOffIcon } from "../../assets/icons";

const RepeatButton = () => {
  const setTooltipText = useTooltipStore((state) => state.setTooltipText);

  const handleButtonPress = useTooltipStore((state) => state.handleButtonPress);
  const handleMouseEnter = useTooltipStore((state) => state.handleMouseEnter);
  const handleMouseLeave = useTooltipStore((state) => state.handleMouseLeave);

  const isRepeat = useRepeatStore((state) => state.isRepeat);
  const toggleRepeat = useRepeatStore((state) => state.toggleRepeat);

  useDelayedText(isRepeat, "リピート：オン", "リピート：オフ");

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
