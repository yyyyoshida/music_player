import React, { useEffect } from 'react';
import { music, playSong } from './PlayMusic';
import { usePlayerContext } from './PlayerContext';
import Tooltip from './Tooltip';
import useButtonTooltip from '../hooks/useButtonTooltip';
import useDelayedText from '../hooks/useDelayText';

const PlayButton = () => {
  const { isPlaying, togglePlayPause, currentSongIndex } = usePlayerContext();
  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();
  const tooltipText = useDelayedText('一時停止', '再生', isPlaying, isPlaying);

  function handlePlayPause() {
    togglePlayPause();
    handleButtonPress();
  }

  // useEffect(() => {
  //   if (isPlaying) {
  //     if (music.src) {
  //       music.play();
  //     } else {
  //       playSong(currentSongIndex);
  //     }
  //   } else {
  //     music.pause();
  //   }
  // }, [isPlaying]);

  return (
    <button
      onClick={handlePlayPause}
      id="js-play-button"
      className={`player-controls__button ${isPlaying ? 'player-controls__button--pause' : 'player-controls__button--play'}`}
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
