import { useState } from "react";
import useDelayedText from "../../hooks/useDelayText";
import useTooltipStore from "../../store/tooltipStore";
import useActionSuccessMessageStore from "../../store/actionSuccessMessageStore";

const ShuffleButton = () => {
  const [isShuffle, setIsShuffle] = useState(false);
  const { setTooltipText, handleButtonPress, handleMouseEnter, handleMouseLeave } = useTooltipStore.getState();
  const showMessage = useActionSuccessMessageStore.getState().showMessage;

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
      onMouseEnter={() => {
        setTooltipText(isShuffle ? "シャッフル：オン" : "シャッフル：オフ");
        handleMouseEnter();
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
