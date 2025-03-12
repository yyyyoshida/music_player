import React from 'react';
import Tooltip from './Tooltip';
import useButtonTooltip from '../hooks/useButtonTooltip';

const RepeatButton = () => {
  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();
  return (
    <button
      className="player-controls__button player-controls__button--repeat"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img id="js-repeat-icon" src="img/リピート.png" alt="" />
      {/* まだ、クリックしたら非表示の機能はない */}
      <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={'tooltip-repeat'}>{`連続再生：オフ`}</Tooltip>
    </button>
  );
};

export default RepeatButton;
