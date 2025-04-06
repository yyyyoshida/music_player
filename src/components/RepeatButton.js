import React, { useEffect } from 'react';
import Tooltip from './Tooltip';
import useButtonTooltip from '../hooks/useButtonTooltip';
import { useRepeatContext } from './RepeatContext';
import useDelayedText from '../hooks/useDelayText';
import { repeatOnIcon, repeatOffIcon } from '../assets/icons';

const RepeatButton = () => {
  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();
  const { isRepeat, toggleRepeat } = useRepeatContext();
  const tooltipText = useDelayedText('オン', 'オフ', isRepeat, isRepeat);

  useEffect(() => {
    console.log('isRepeatが変わった瞬間', isRepeat);
  }, [isRepeat]);

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
      {/* <img src={isRepeat ? 'img/repeat-on.png' : 'img/repeat.png'} alt="Repeat Icon" width="18" height="18" /> */}
      {/* <img src={isRepeat ? 'img/repeat-on.png' : 'img/repeat.png'} alt="Repeat Icon" width="18" height="18" /> */}
      <img src={isRepeat ? repeatOnIcon : repeatOffIcon} alt="Repeat Icon" width="18" height="18" />

      <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={'tooltip-repeat'}>
        {`リピート：${tooltipText}`}
      </Tooltip>
    </button>
  );
};

export default RepeatButton;
