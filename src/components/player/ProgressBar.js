import { useState, useEffect, useRef, useContext } from "react";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { useRepeatContext } from "../../contexts/RepeatContext";
import { PlaybackContext } from "../../contexts/PlaybackContext";
import useBarHandler from "../../hooks/useBarHandler";

const ProgressBar = ({ initialValue }) => {
  const barRef = useRef(null);

  const { currentTime, isTrackSet, isLocalReady, seekToSpotify, duration, position, isPlaying, setIsPlaying, isLocalPlaying, audioRef } =
    usePlayerContext();
  const { isRepeat } = useRepeatContext();
  const { goToNextTrack, currentIndex } = useContext(PlaybackContext);
  const { percentage, setPercentage, isDragging, roundToTwoDecimals, handleMouseDown } = useBarHandler({
    type: "progress",
    value: initialValue,
    barRef: barRef,
  });

  const LOADING_DELAY = 200;

  //備忘録　 Spotifyの曲が再生中に再生バーを自動更新する
  useEffect(() => {
    if (isDragging) return;

    if (!isLocalPlaying && duration && !isNaN(duration)) {
      const newTime = roundToTwoDecimals(position);

      setPercentage(newTime);
      return;
    }
  }, [position, isLocalPlaying]);

  // 備忘録　ローカルの曲が再生中に再生バーを自動更新する
  useEffect(() => {
    if (!audioRef?.current) return;
    const audio = audioRef.current;

    const updateProgress = () => {
      if (isDragging) return;
      // console.log(audio.currentTime);
      const newTime = roundToTwoDecimals((audio.currentTime / audio.duration) * 100);
      setPercentage(newTime || 0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, [position, isLocalPlaying, isDragging]);

  // 曲のソースが変わったとき
  useEffect(() => {
    setPercentage(0);
  }, [isLocalPlaying]);

  //備忘録 ドラッグしてクリックが外れたときに再生位置を反映
  useEffect(() => {
    if (isDragging) return;

    if (isLocalPlaying && audioRef?.current) {
      if (!isLocalReady) return;

      const audio = audioRef?.current;
      const seekTime = (percentage / 100) * audio.duration;

      audio.currentTime = seekTime;
    } else {
      const seekTime = Math.trunc((percentage / 100) * duration);

      seekToSpotify(seekTime);
    }
  }, [isDragging, isLocalPlaying, isLocalReady]);

  // ローカルの曲の再生が終わった後の処理
  useEffect(() => {
    if (!audioRef?.current) return;

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
    return () => audio.removeEventListener("ended", handleEnded);
  }, [isRepeat, isLocalPlaying]);

  // Spotifyの曲の再生が終わった後の処理
  useEffect(() => {
    if (isLocalPlaying || !isTrackSet) return;

    const isTrackFinished = currentTime !== 0 && duration - currentTime <= 200;

    if (isTrackFinished && isRepeat) return seekToSpotify(0);

    if (isTrackFinished) setIsPlaying(false);
    if (isTrackFinished && !isRepeat && !isPlaying) {
      seekToSpotify(0);
      goToNextTrack();
    }
    // }, [currentTime, duration]);
  }, [currentTime, duration, isRepeat, isPlaying]);

  const [visibleLoading, setVisibleLoading] = useState(false);

  useEffect(() => {
    setVisibleLoading(true);

    const timer = setTimeout(() => {
      if (!isLocalReady) return;
      setVisibleLoading(false);
    }, LOADING_DELAY);

    return () => clearTimeout(timer);
  }, [isLocalReady]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.currentTime = 0;
    seekToSpotify(0);
  }, [currentIndex]);

  return (
    <>
      <div ref={barRef} className="player-controls__progress-bar--wrapper" onMouseDown={handleMouseDown}>
        {isLocalPlaying && visibleLoading ? (
          <div className="progress-bar-loading"></div>
        ) : (
          <div className="player-controls__progress-bar">
            <div className="player-controls__progress-fill" style={{ width: `${percentage}%` }}>
              <div className="player-controls__progress-thumb" style={{ left: `${percentage}%` }}></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProgressBar;
