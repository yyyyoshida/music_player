import React, { useState, useEffect, useRef } from 'react';
import { music, songs, playSong } from './PlayMusic';
import { usePlayerContext } from './PlayerContext';
import Tooltip from './Tooltip';
import useButtonTooltip from '../hooks/useButtonTooltip';
// import RepeatButton from './RepeatButton';

const Bar = ({ ParentClassName, type, value, isRepeat, setIsRepeat }) => {
  const [percentage, setPercentage] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [volumeIcon, setVolumeIcon] = useState(updateVolumeIcon(percentage));
  const { isPlaying, currentSongIndex, setCurrentSongIndex } = usePlayerContext();
  const currentSongIndexRef = useRef(null);
  const barRef = useRef(null);
  const volumeValueRef = useRef(percentage);

  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();
  const [isMuted, setIsMuted] = useState(false);
  // const [isRepeat, setIsRepeat] = useState(false);
  const isRepeatRef = useRef(null);

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
    isRepeatRef.current = isRepeat;
    currentSongIndexRef.current = currentSongIndex;
  }, [isRepeat, currentSongIndex]);

  useEffect(() => {
    console.log('typeの再レンダリング');
    if (type === 'progress') {
      const updateProgress = () => {
        const newPercentage = (music.currentTime / music.duration) * 100;
        setPercentage(newPercentage);

        if (music.currentTime >= music.duration) {
          if (isRepeatRef.current) {
            playSong(currentSongIndexRef.current);
            return;
          }
          setCurrentSongIndex((prevIndex) => {
            const newIndex = (prevIndex + 1) % songs.length;
            playSong(newIndex);
            restProgressBar();
            return newIndex;
          });
        }
      };
      music.addEventListener('timeupdate', updateProgress);
      return () => {
        music.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, [type]);

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

  function restProgressBar() {
    setPercentage(0);
    music.currentTime = 0;
  }

  useEffect(() => {
    if (type !== 'progress') return;

    function resetProgress() {
      if (!isNaN(music.duration)) {
        setPercentage(0);
        music.currentTime = 0;
      }
    }

    if (!isNaN(music.duration)) {
      resetProgress();
    } else {
      const onLoadedMetadata = () => {
        resetProgress();
        music.removeEventListener('loadedmetadata', onLoadedMetadata);
      };
      music.addEventListener('loadedmetadata', onLoadedMetadata);

      return () => {
        music.removeEventListener('loadedmetadata', onLoadedMetadata);
      };
    }
  }, [currentSongIndex, type]);

  function toggleMute() {
    handleButtonPress();

    setIsMuted((prevMuted) => !prevMuted);
    music.muted = !isMuted;
    setVolumeIcon(!isMuted ? 'img/volume-off.png' : updateVolumeIcon(volumeValueRef.current));
    if (!isMuted) volumeValueRef.current = percentage;
  }

  return (
    <>
      {type === 'volume' && (
        <button
          className="player-controls__button player-controls__button--volume"
          onClick={toggleMute}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img src={volumeIcon} alt="Volume Icon" className="player-controls__button--volume-icon" />
          <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={'tooltip-volume'}>
            {isMuted ? 'ミュート解除' : 'ミュート'}
          </Tooltip>
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
