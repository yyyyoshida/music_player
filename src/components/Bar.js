import React, { useState, useEffect, useRef } from 'react';
import { music } from './PlayMusic';
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

  const { currentSongIndex } = usePlayerContext();
  const { isRepeat } = useRepeatContext();

  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();
  const tooltipText = useDelayedText('ミュート解除', 'ミュート', isMuted, isMuted);

  // const { updateVolume, seekTo, getCurrentTrackDuration, duration, position } = usePlayerContext();
  const { updateVolume, seekTo, duration, position } = usePlayerContext();

  useEffect(() => {
    volumeValueRef.current = Math.max(0, Math.min(100, volumeValueRef.current));
    updateVolume(volumeValueRef.current / 100);
  }, []);

  useEffect(() => {
    if (type === 'volume') return;

    if (duration !== 0 && duration !== null && !isNaN(duration)) {
      const newTime = toFixedNumber(position);
      setPercentage(newTime);
    }
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    if (type === 'volume' && duration) return;
    const seekTime = Math.trunc((percentage / 100) * duration);
    seekTo(seekTime);
  }, [duration, percentage, isDragging]);

  const handleClickBar = (e) => {
    const barRect = barRef.current.getBoundingClientRect();
    const clickX = e.clientX - barRect.left;
    const newPercentage = toFixedNumber((clickX / barRect.width) * 100);

    if (type === 'progress') {
      setPercentage(newPercentage);
      return;
    }

    if (type === 'volume') {
      volumeValueRef.current = newPercentage;
      setPercentage(newPercentage);
      updateVolume(volumeValueRef.current / 100);
      return;
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
    const newPercentage = toFixedNumber(Math.min(Math.max((moveX / barRect.width) * 100, 0), 100));

    if (type === 'progress') {
      setPercentage(newPercentage);
      return;
    }

    if (type === 'volume') {
      volumeValueRef.current = newPercentage;
      setPercentage(newPercentage);
      updateVolume(volumeValueRef.current / 100);
      return;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleMouseUp);
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

  function toggleMute() {
    handleButtonPress();

    setIsMuted((prevMuted) => !prevMuted);
    music.muted = !isMuted;
    if (!isMuted) volumeValueRef.current = percentage;
  }

  function toFixedNumber(value) {
    return parseFloat(value.toFixed(2));
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
