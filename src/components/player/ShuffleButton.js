import { useState, useContext } from "react";
import useDelayedText from "../../hooks/useDelayText";
import { TooltipContext } from "../../contexts/TooltipContext";

const ShuffleButton = () => {
  const [isShuffle, setIsShuffle] = useState(false);

  useDelayedText(isShuffle, "シャッフル：オン", "シャッフル：オフ");
  const { handleButtonPress, handleMouseEnter, handleMouseLeave, setTooltipText } = useContext(TooltipContext);

  function toggleShuffle() {
    setIsShuffle((prev) => !prev);
    handleButtonPress();
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
