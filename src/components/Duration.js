import React, { useState, useEffect, useRef } from 'react';
import { music } from './PlayMusic';
import { usePlayerContext } from './PlayerContext';

const Duration = () => {
  const [duration, setDuration] = useState('0:00');
  const { currentSongIndex } = usePlayerContext();

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  useEffect(() => {
    console.log('setDurationのレンダリング');
    // setDuration(formatTime(music.duration));
    const updateDuration = () => {
      setDuration(formatTime(music.duration));
    };
    // updateDuration();
    music.addEventListener('loadedmetadata', updateDuration);

    return () => {
      music.removeEventListener('loadedmetadata', updateDuration);
    };
    // }, [currentSongIndex]);
  }, []);
  return (
    <span id="js-duration" className="player-controls__duration">
      {duration}
    </span>
  );
};

export default Duration;
