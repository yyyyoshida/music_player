import React, { useState, useEffect } from 'react';
// import Songs from './Songs';
import { music, songs, playSong, currentSongIndex } from './PlayMusic';
// const music = new Audio();

const PlayButton = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying((isPlaying) => !isPlaying);
    // if (isPlaying) {
    //   music.pause();
    //   console.log('停止');
    // } else {
    //   console.log('再生');
    //   playSong(currentSongIndex);
    //   // if (isPlaying)のuseEffectを使うメリットデメリットを考えろ ↓↓
    // }
  };

  useEffect(() => {
    if (isPlaying) {
      console.log('再生');
      // music.src = songs[0].path;
      playSong(currentSongIndex);
      // music.play();
    } else {
      console.log('停止');
      music.pause();
    }
  }, [isPlaying]);

  return (
    <button
      onClick={handlePlayPause}
      id="js-play-button"
      className={`player-controls__button ${isPlaying ? 'player-controls__button--pause' : 'player-controls__button--play'}`}
    ></button>
  );
};
export default PlayButton;
