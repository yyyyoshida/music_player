import React from 'react';
import Tooltip from './Tooltip';
import useButtonTooltip from '../hooks/useButtonTooltip';
import { useRepeatContext } from './RepeatContext';

const RepeatButton = () => {
  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();
  const { isRepeat, toggleRepeat } = useRepeatContext();

  return (
    <button
      className="player-controls__button player-controls__button--repeat"
      onClick={() => {
        toggleRepeat();
        handleButtonPress();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img id="js-repeat-icon" src={isRepeat ? 'img/リピートオン.png' : 'img/リピート.png'} alt="Repeat Icon" />

      <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={'tooltip-repeat'}>
        {`リピート：${isRepeat ? 'オン' : 'オフ'}`}
      </Tooltip>
    </button>
  );
};

export default RepeatButton;
