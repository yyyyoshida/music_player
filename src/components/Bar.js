import React, { useState, useEffect, useRef } from 'react';
import { music, songs, playSong } from './PlayMusic';
import { usePlayerContext } from './PlayerContext';
import Tooltip from './Tooltip';
import useButtonTooltip from '../hooks/useButtonTooltip';
import { useRepeatContext } from './RepeatContext';
import useDelayedText from '../hooks/useDelayText';
import VolumeIcon from './VolumeIcon';

const Bar = ({ ParentClassName, type, value }) => {
  const [percentage, setPercentage] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const currentSongIndexRef = useRef(null);
  const barRef = useRef(null);
  const volumeValueRef = useRef(percentage);
  const isRepeatRef = useRef(null);

  const { currentSongIndex, setCurrentSongIndex } = usePlayerContext();
  const { isRepeat } = useRepeatContext();

  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();
  const tooltipText = useDelayedText('ミュート解除', 'ミュート', isMuted, isMuted);

  useEffect(() => {
    volumeValueRef.current = Math.max(0, Math.min(100, volumeValueRef.current));
    music.volume = volumeValueRef.current / 100;
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
          <VolumeIcon volume={percentage} isMuted={isMuted} />

          <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={'tooltip-volume'}>
            {tooltipText}
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
