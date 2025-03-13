import React, { useState, useEffect, useRef } from 'react';
import { music } from './PlayMusic';

const CurrentTime = () => {
  const [currentTime, setCurrentTime] = useState('0:00');

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  // 【自分用メモ】↓
  // useEffectを使う理由はtimeupdateのレンダリングがされる度にイベントリスナーの重複登録を防ぐため
  // イベントリスナーが一回だけ登録されて、２回目以降は登録しないようにするため
  useEffect(() => {
    console.log('現在の時間のレンダリング');
    const updateCurrentTime = () => {
      setCurrentTime(formatTime(music.currentTime));
    };
    music.addEventListener('timeupdate', updateCurrentTime);
    return () => {
      music.removeEventListener('timeupdate', updateCurrentTime);
    };
  }, []);

  return (
    <span id="js-current-time" className="player-controls__current-time">
      {currentTime}
    </span>
  );
};

export default CurrentTime;
