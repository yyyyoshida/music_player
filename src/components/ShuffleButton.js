import React, { useState, useEffect } from 'react';
import Tooltip from './Tooltip';
import useButtonTooltip from '../hooks/useButtonTooltip';
import useDelayedText from '../hooks/useDelayText';

const ShuffleButton = () => {
  const [isShuffle, setIsShuffle] = useState(false);

  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();
  const tooltipText = useDelayedText('オン', 'オフ', isShuffle, isShuffle);

  function toggleShuffle() {
    setIsShuffle((prev) => !prev);
    handleButtonPress();
  }

  return (
    <button
      id="js-player-controls"
      className="player-controls__button player-controls__button--shuffle"
      onClick={toggleShuffle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* <img src="img/シャッフル.png" alt=""></img> */}
      <img src={isShuffle ? '/img/シャッフルオン.png' : '/img/シャッフル.png'} alt="Shuffle Icon" />
      {/* まだ、クリックしたら非表示の機能はない */}
      <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={'tooltip-shuffle'}>
        {`シャッフル：${tooltipText}`}
      </Tooltip>
    </button>
  );
};

export default ShuffleButton;
