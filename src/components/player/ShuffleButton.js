import { useState } from "react";
import useDelayedText from "../../hooks/useDelayText";
import useTooltipStore from "../../store/tooltipStore";
import useActionSuccessMessageStore from "../../store/actionSuccessMessageStore";

const ShuffleButton = () => {
  const [isShuffle, setIsShuffle] = useState(false);
  const setTooltipText = useTooltipStore((state) => state.setTooltipText);
  const handleButtonPress = useTooltipStore((state) => state.handleButtonPress);
  const handleMouseEnter = useTooltipStore((state) => state.handleMouseEnter);
  const handleMouseLeave = useTooltipStore((state) => state.handleMouseLeave);

  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

  useDelayedText(isShuffle, "シャッフル：オン", "シャッフル：オフ");

  function toggleShuffle() {
    setIsShuffle((prev) => !prev);
    handleButtonPress();
    showMessage("未実装");
  }

  return (
    <button
      id="js-player-controls"
      className="player-controls__button player-controls__button--shuffle"
      onClick={toggleShuffle}
      onMouseEnter={(e) => {
        setTooltipText(isShuffle ? "シャッフル：オン" : "シャッフル：オフ");
        handleMouseEnter(e);
      }}
      onMouseLeave={() => {
        handleMouseLeave();
      }}
    >
      <img src={isShuffle ? "/img/シャッフルオン.png" : "/img/シャッフル.png"} alt="Shuffle Icon" />
    </button>
  );
};

export default ShuffleButton;
