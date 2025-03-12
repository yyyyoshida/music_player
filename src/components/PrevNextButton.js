import React, { useState, useEffect, useRef } from 'react';
import { usePlayerContext } from './PlayerContext';
import { music, songs, playSong, loadSong } from './PlayMusic';

const PrevNextButton = ({ type }) => {
  const { isPlaying, setCurrentSongIndex } = usePlayerContext();
  const [isClickable, setIsClickable] = useState(true);
  const clickDelay = 350;

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
    setIsClickable(false);
    if (type === 'prev') {
      prevSong(); // 曲を変更
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
    <button className={`player-controls__button ${type === 'next' ? 'next-button' : 'prev-button'}`} onClick={handlePrevNextClick}>
      {type === 'next' && <img src="img/next-icon.png" alt="Next" />}
      {type === 'prev' && <img src="img/prev-icon.png" alt="Previous" />}
      {type === 'next' && <span className="tooltip-next tooltip">次へ</span>}
      {type === 'prev' && <span className="tooltip-prev tooltip">前へ</span>}
    </button>
  );
};

export default PrevNextButton;
