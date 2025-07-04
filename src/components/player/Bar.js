import { useState, useEffect, useRef, useContext } from "react";
import { usePlayerContext } from "../../contexts/PlayerContext";
import Tooltip from "../Tooltip";
import useButtonTooltip from "../../hooks/useButtonTooltip";
import { useRepeatContext } from "../../contexts/RepeatContext";
import useDelayedText from "../../hooks/useDelayText";
import VolumeIcon from "./VolumeIcon";
import { PlaybackContext } from "../../contexts/PlaybackContext";

const Bar = ({ ParentClassName, type, value }) => {
  const [percentage, setPercentage] = useState(() => {
    const saved = localStorage.getItem("player_volume");
    return type === "volume" ? parseFloat(saved) || value : value;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem("isMuted");
    return savedMute ? JSON.parse(savedMute) : false;
  });

  const barRef = useRef(null);

  const { playerReady, currentTime, isTrackSet, isLocalReady } = usePlayerContext();
  const { isRepeat } = useRepeatContext();
  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip();
  const tooltipText = useDelayedText("ミュート解除", "ミュート", isMuted, isMuted);
  const { updateVolume, seekToSpotify, duration, position, isPlaying, setIsPlaying, isLocalPlaying, audioRef } = usePlayerContext();
  const { goToNextTrack } = useContext(PlaybackContext);

  const isVolumeType = type === "volume";
  const isProgressType = type === "progress";

  useEffect(() => {
    if (isProgressType || !playerReady) return;

    const savedVolume = localStorage.getItem("player_volume");
    const initialVolume = savedVolume ? parseFloat(savedVolume) : 30;

    setPercentage(initialVolume);

    !isMuted ? applyVolume(initialVolume / 100) : applyVolume(0);
  }, [isMuted, playerReady]);

  //備忘録　 Spotifyの曲が再生中に再生バーを自動更新する
  useEffect(() => {
    if (isDragging) return;
    if (isVolumeType) return;

    if (!isLocalPlaying && duration && !isNaN(duration)) {
      const newTime = roundToTwoDecimals(position);

      setPercentage(newTime);
      return;
    }
  }, [position, type, isLocalPlaying]);

  // 備忘録　ローカルの曲が再生中に再生バーを自動更新する
  useEffect(() => {
    if (isVolumeType || !audioRef?.current) return;

    const audio = audioRef.current;

    const updateProgress = () => {
      if (isDragging) return;
      const newTime = roundToTwoDecimals((audio.currentTime / audio.duration) * 100);
      setPercentage(newTime || 0);
    };

    audio.addEventListener("timeupdate", updateProgress);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, [position, type, isLocalPlaying, isDragging]);

  //備忘録 ドラッグが終わったときに再生位置を反映
  useEffect(() => {
    if (isDragging) return;

    if (isVolumeType) return;

    if (isLocalPlaying && audioRef?.current) {
      if (!isLocalReady) return;

      const audio = audioRef.current;
      const seekTime = (percentage / 100) * audio.duration;
      audio.currentTime = seekTime;
    } else {
      const seekTime = Math.trunc((percentage / 100) * duration);

      seekToSpotify(seekTime);
    }
  }, [isDragging, isLocalPlaying, isLocalReady]);

  function applyVolume(value) {
    audioRef.current.volume = value;
    updateVolume(value);
  }

  function handleVolumeChange(newPercentage) {
    setPercentage(newPercentage);

    if (!playerReady) return;

    applyVolume(newPercentage / 100);
  }

  function handleClickBar(e) {
    if (isProgressType && isLocalPlaying && !isLocalReady) return;

    const barRect = barRef.current.getBoundingClientRect();
    const clickX = e.clientX - barRect.left;
    const newPercentage = roundToTwoDecimals((clickX / barRect.width) * 100);
    console.log(newPercentage);
    if (isProgressType) {
      setPercentage(newPercentage);
      return;
    }

    if (isVolumeType) {
      handleVolumeChange(newPercentage);
    }
  }

  function handleMouseDown(e) {
    setIsDragging(true);
    handleClickBar(e);
  }

  // 備忘録　ドラッグ中にバーの位置を％で計算して見た目だけ反映させる（実際の音量やシークは別処理）
  function handleDrag(e) {
    if (!isDragging) return;

    if (isProgressType && isLocalPlaying && !isLocalReady) return;

    const barRect = barRef.current.getBoundingClientRect();
    const moveX = e.clientX - barRect.left;
    const newPercentage = roundToTwoDecimals(Math.min(Math.max((moveX / barRect.width) * 100, 0), 100));

    if (isProgressType) {
      setPercentage(newPercentage);
      return;
    }

    if (isVolumeType) {
      handleVolumeChange(newPercentage);
    }
  }

  useEffect(() => {
    if (isProgressType) return;

    localStorage.setItem("player_volume", percentage);
  }, [percentage]);

  function handleMouseUp() {
    setIsDragging(false);
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  function toggleMute() {
    handleButtonPress();

    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    const newVolume = nextMuted ? 0 : percentage / 100;

    applyVolume(newVolume);
  }

  useEffect(() => {
    localStorage.setItem("isMuted", isMuted);
    if (isMuted) localStorage.setItem("player_volume", percentage);
  }, [isMuted]);

  function roundToTwoDecimals(value) {
    return parseFloat(value.toFixed(2));
  }

  // ローカルの曲の再生が終わった後の処理
  useEffect(() => {
    if (isVolumeType || !audioRef?.current) return;

    const audio = audioRef.current;

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        goToNextTrack();
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [type, isRepeat, isLocalPlaying]);

  // Spotifyの曲の再生が終わった後の処理
  useEffect(() => {
    if (isLocalPlaying || !isTrackSet) return;
    const isTrackFinished = isProgressType && duration - currentTime <= 200;

    if (isTrackFinished && isRepeat) return seekToSpotify(0);

    if (isTrackFinished) setIsPlaying(false);
    if (isTrackFinished && !isRepeat && !isPlaying) {
      seekToSpotify(0);
      goToNextTrack();
    }
  }, [currentTime, duration]);

  return (
    <>
      {isVolumeType && (
        <button
          className="player-controls__button player-controls__button--volume"
          onClick={toggleMute}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <VolumeIcon volume={percentage} isMuted={isMuted} />

          <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={"tooltip-volume"}>
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
