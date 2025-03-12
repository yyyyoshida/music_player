import React from 'react';
import Tooltip from './Tooltip';
import useButtonTooltip from '../hooks/useButtonTooltip';

const ShuffleButton = () => {
  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();

  return (
    <button
      id="js-player-controls"
      className="player-controls__button player-controls__button--shuffle"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img id="js-shuffle-icon" src="img/シャッフル.png" alt=""></img>
      {/* まだ、クリックしたら非表示の機能はない */}
      <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={'tooltip-shuffle'}>{`シャッフル：オフ`}</Tooltip>
    </button>
  );
};

export default ShuffleButton;
