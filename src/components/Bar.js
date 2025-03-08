import React, { useState, useEffect, useRef } from 'react';
// import { music, songs, currentSongIndex, setCurrentSongIndex, playSong } from './PlayMusic';
import { music, songs, playSong } from './PlayMusic';

const Bar = ({ ParentClassName, type, value }) => {
  const [percentage, setPercentage] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const volumeValueRef = useRef(percentage);
  const [volumeIcon, setVolumeIcon] = useState(updateVolumeIcon(percentage));
  const barRef = useRef(null);

  useEffect(() => {
    volumeValueRef.current = Math.max(0, Math.min(100, volumeValueRef.current));
    music.volume = volumeValueRef.current / 100;
    setVolumeIcon(updateVolumeIcon(volumeValueRef.current)); // アイコン更新
  }, []);

  const handleClickBar = (e) => {
    const barRect = barRef.current.getBoundingClientRect();
    const clickX = e.clientX - barRect.left;
    const newPercentage = (clickX / barRect.width) * 100;
    const newCurrentTime = (newPercentage / 100) * music.duration;

    if (type === 'progress') {
      setPercentage(newPercentage);
      if (isFinite(newCurrentTime)) {
        music.currentTime = newCurrentTime;
      }
    } else if (type === 'volume') {
      volumeValueRef.current = newPercentage;
      setPercentage(newPercentage);
      music.volume = Math.max(0, Math.min(1, newPercentage / 100));
      setVolumeIcon(updateVolumeIcon(newPercentage)); // アイコンも更新
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleClickBar(e);
  };

  const handleDrag = (e) => {
    if (!isDragging) return;

    const barRect = barRef.current.getBoundingClientRect();
    const moveX = e.clientX - barRect.left;
    const newPercentage = Math.min(Math.max((moveX / barRect.width) * 100, 0), 100);
    const newCurrentTime = (newPercentage / 100) * music.duration;

    if (type === 'progress') {
      setPercentage(newPercentage);
      if (isFinite(newCurrentTime)) {
        music.currentTime = newCurrentTime;
      }
    } else if (type === 'volume') {
      volumeValueRef.current = newPercentage;
      setPercentage(newPercentage);
      music.volume = Math.max(0, Math.min(1, newPercentage / 100));
      setVolumeIcon(updateVolumeIcon(newPercentage)); // アイコン更新
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    console.log('isDraggingの再レンダリング');
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    console.log('typeの再レンダリング');
    if (type === 'progress') {
      const updateProgress = () => {
        const newPercentage = (music.currentTime / music.duration) * 100;
        setPercentage(newPercentage);

        if (music.currentTime >= music.duration) {
          // playNextSong();
        }
      };
      music.addEventListener('timeupdate', updateProgress);
      return () => {
        music.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, [type]);

  // function playNextSong() {
  //   // if (repeat.classList.contains('is-repeat')) {
  //   //   playSong(currentSongIndex);
  //   //   return;
  //   // }
  //   // currentSongIndex = (currentSongIndex + 1) % songs.length;
  //   const nextIndex = (currentSongIndex + 1) % songs.length;
  //   setCurrentSongIndex(nextIndex);
  //   music.src = songs[nextIndex].path;
  //   music.play();
  //   // playSong(nextIndex);
  // }

  function updateVolumeIcon(percentage) {
    if (percentage === 0) {
      return 'img/volume-off.png';
    } else if (percentage < 30) {
      return 'img/volume-medium.png';
    } else if (percentage < 70) {
      return 'img/volume-high.png';
    } else {
      return 'img/volume-full.png';
    }
  }

  return (
    <>
      {type === 'volume' && (
        <button className="player-controls__button player-controls__button--volume">
          <img src={volumeIcon} alt="Volume Icon" className="player-controls__button--volume-icon" />
        </button>
      )}
      <div ref={barRef} className={`${ParentClassName}-bar--wrapper`} onMouseDown={handleMouseDown}>
        <div className={`${ParentClassName}-bar`}>
          <div className={`${ParentClassName}-fill`} style={{ width: `${percentage}%` }}>
            <div className={`${ParentClassName}-thumb`} style={{ left: `${percentage}%` }}></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Bar;
