import React from 'react';
import Tooltip from './Tooltip';
import useButtonTooltip from '../hooks/useButtonTooltip';
import { useRepeatContext } from './RepeatContext';
import useDelayedText from '../hooks/useDelayText';

const RepeatButton = () => {
  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();
  const { isRepeat, toggleRepeat } = useRepeatContext();
  const tooltipText = useDelayedText('オン', 'オフ', isRepeat, isRepeat);

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
        {`リピート：${tooltipText}`}
      </Tooltip>
    </button>
  );
};

export default RepeatButton;
