import React from 'react';
import Tooltip from './Tooltip';
import useButtonTooltip from '../hooks/useButtonTooltip';

const RepeatButton = ({ isRepeat, setIsRepeat }) => {
  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();

  const toggleRepeat = () => {
    handleButtonPress();
    setIsRepeat((prev) => !prev); // リピート状態を切り替える
  };

  return (
    <button
      className="player-controls__button player-controls__button--repeat"
      onClick={toggleRepeat}
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
