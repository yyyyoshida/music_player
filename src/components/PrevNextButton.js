import React, { useState } from 'react';
import { usePlayerContext } from './PlayerContext';
import { songs, playSong, loadSong } from './PlayMusic';
import Tooltip from './Tooltip';
import useButtonTooltip from '../hooks/useButtonTooltip';

const PrevNextButton = ({ type }) => {
  const { isPlaying, setCurrentSongIndex } = usePlayerContext();
  const [isClickable, setIsClickable] = useState(true);
  const clickDelay = 350;
  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();

  function playLoadSong(index) {
    // console.log(index);
    if (isPlaying) {
      playSong(index);
    } else {
      loadSong(index);
    }
  }

  function handlePrevNextClick() {
    if (!isClickable) return;
    handleButtonPress();
    setIsClickable(false);
    if (type === 'prev') {
      prevSong();
    } else {
      nextSong();
    }
    setTimeout(() => {
      setIsClickable(true);
    }, clickDelay);
  }

  function prevSong() {
    setCurrentSongIndex((prevIndex) => {
      const newIndex = (prevIndex - 1 + songs.length) % songs.length;
      playLoadSong(newIndex);
      return newIndex;
    });
  }
  function nextSong() {
    setCurrentSongIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % songs.length;
      playLoadSong(newIndex);
      return newIndex;
    });
  }

  return (
    <button
      className={`player-controls__button ${type === 'next' ? 'next-button' : 'prev-button'}`}
      onClick={handlePrevNextClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {type === 'next' && <img src="/img/next-icon.png" alt="Next" />}
      {type === 'prev' && <img src="/img/prev-icon.png" alt="Previous" />}

      <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={type === 'next' ? 'tooltip-next' : 'tooltip-prev'}>
        {type === 'next' ? '次へ' : '前へ'}
      </Tooltip>
    </button>
  );
};

export default PrevNextButton;
