import React, { useState, useEffect } from 'react';
// import Songs from './Songs';
// import { music, songs, playSong, currentSongIndex } from './PlayMusic';
import { music, songs, playSong } from './PlayMusic';
// import { useSongStore } from '../stores/songStore';
// import { isPlaying, usePlayerContext } from './PlayerContext';
import { usePlayerContext } from './PlayerContext';

const PlayButton = () => {
  // const { currentSongIndex } = useSongStore(); // store？を使ったやり方
  // const [isPlaying, setIsPlaying] = useState(false);

  const { isPlaying, togglePlayPause, currentSongIndex } = usePlayerContext();
  // const { isPlaying } = usePlayerContext();

  const handlePlayPause = () => {
    // console.log(isPlaying);
    // if (isPlaying) {
    //   console.log('再生');
    //   playSong(currentSongIndex); // 再生処理
    // } else {
    //   console.log('停止');
    //   music.pause(); // 停止処理
    // }
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

  // useEffect(() => {
  //   const delayAction = setTimeout(() => {
  //     if (isPlaying) {
  //       console.log('再生');
  //       playSong(currentSongIndex); // 再生処理
  //     } else {
  //       console.log('停止');
  //       music.pause(); // 停止処理
  //     }
  //   }, 1);

  //   // クリーンアップ関数（コンポーネントがアンマウントされたり、`isPlaying`が変わるたびにタイマーをクリア）
  //   return () => clearTimeout(delayAction);
  // }, [isPlaying, currentSongIndex]);

  // 片方のuseEffectに遅延をかけて、同時処理エラーは不正だけど根本的な解決になってない
  // それぞれの関数をuseEffectひとつにまとめる必要がある✅✅✅

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
