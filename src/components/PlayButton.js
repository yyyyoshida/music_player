import React, { useState, useEffect } from 'react';
import { music, songs, playSong } from './PlayMusic';
import { usePlayerContext } from './PlayerContext';

const PlayButton = () => {
  const { isPlaying, togglePlayPause, currentSongIndex } = usePlayerContext();

  const handlePlayPause = () => {
    togglePlayPause();
    // setIsPlaying((isPlaying) => !isPlaying);
  };

  useEffect(() => {
    if (isPlaying) {
      if (music.src) {
        music.play();
      } else {
        playSong(currentSongIndex);
      }
    } else {
      music.pause();
    }
  }, [isPlaying]);
  // }, [currentSongIndex]);

  return (
    <button
      onClick={handlePlayPause}
      id="js-play-button"
      className={`player-controls__button ${isPlaying ? 'player-controls__button--pause' : 'player-controls__button--play'}`}
      // className={`player-controls__button ${isPlaying ? 'player-controls__button--play' : 'player-controls__button--pause'}`}
    ></button>
  );
};
export default PlayButton;
