import React, { useState, useEffect } from 'react';
import { usePlayerContext } from './PlayerContext';

const Duration = () => {
  const [SongDuration, setSongDuration] = useState('0:00');
  const { duration, formatTime } = usePlayerContext();

  useEffect(() => {
    setSongDuration(formatTime(duration));
  }, [duration]);

  return (
    <span id="js-duration" className="player-controls__duration">
      {SongDuration}
    </span>
  );
};

export default Duration;
