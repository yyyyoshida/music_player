import React, { useEffect, useState } from 'react';
import { usePlayerContext } from './PlayerContext';
import Tooltip from './Tooltip';
import useButtonTooltip from '../hooks/useButtonTooltip';
import useDelayedText from '../hooks/useDelayText';

const PlayButton = () => {
  const { isPlaying, togglePlayPause, currentSongIndex, isClassName, setIsClassName } = usePlayerContext();
  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();
  const tooltipText = useDelayedText('一時停止', '再生', isPlaying, isPlaying);

  // const [isClassName, setIsClassName] = useState('player-controls__button--play');

  function handlePlayPause() {
    togglePlayPause();
    handleButtonPress();
  }

  useEffect(() => {
    console.log('検知！！！ isPlaying', isPlaying);

    // if (isPlaying) {
    //   setIsClassName('player-controls__button--pause');
    // }

    // if (!isPlaying) {
    //   setIsClassName('player-controls__button--play');
  }, [isPlaying]);

  return (
    <button
      onClick={handlePlayPause}
      id="js-play-button"
      className={`player-controls__button ${isPlaying ? 'player-controls__button--pause' : 'player-controls__button--play'} `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={isPlaying ? 'tooltip-pause' : 'tooltip-play'}>
        {tooltipText}
      </Tooltip>
    </button>
  );
};
export default PlayButton;
