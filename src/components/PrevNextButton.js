import React, { useEffect, useRef } from 'react';
import { usePlayerContext } from './PlayerContext';
import { music, songs, playSong, loadSong } from './PlayMusic';

const PrevNextButton = ({ type }) => {
  const { isPlaying, setCurrentSongIndex } = usePlayerContext();

  function playLoadSong(index) {
    // console.log(index);
    if (isPlaying) {
      playSong(index);
    } else {
      loadSong(index);
    }
  }

  function handlePrevNextClick() {
    if (type === 'prev') {
      prevSong(); // 曲を変更
    } else {
      nextSong();
    }
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
    <button className="player-controls__button" onClick={handlePrevNextClick}>
      {type === 'next' && <img src="img/next-icon.png" alt="Next" />}
      {type === 'prev' && <img src="img/prev-icon.png" alt="Previous" />}
    </button>
  );
};

export default PrevNextButton;
