import { useState, useEffect, useRef } from "react";
import useRepeatStore from "../../store/repeatStore";
import usePlaybackStore from "../../store/playbackStore";
import useBarHandler from "../../hooks/useBarHandler";
import usePlayerStore from "../../store/playerStore";

const ProgressBar = ({ initialValue }) => {
  const barRef = useRef(null);

  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);
  const playDisable = usePlayerStore((state) => state.playDisable);
  const isLocalPlaying = usePlayerStore((state) => state.isLocalPlaying);
  const isLocalReady = usePlayerStore((state) => state.isLocalReady);
  const audioRef = usePlayerStore((state) => state.audioRef);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const seekToSpotify = usePlayerStore((state) => state.seekToSpotify);
  const updateVolume = usePlayerStore((state) => state.updateVolume);
  const isTrackSet = usePlayerStore((state) => state.isTrackSet);

  const currentIndex = usePlaybackStore((state) => state.currentIndex);
  const goToNextTrack = usePlaybackStore((state) => state.goToNextTrack);
  const isRepeat = useRepeatStore((state) => state.isRepeat);

  const { percentage, setPercentage, isDragging, roundToTwoDecimals, handleMouseDown } = useBarHandler({
    type: "progress",
    value: initialValue,
    barRef: barRef,
  });

  const LOADING_DELAY = 200;
  const [hasHandledEnd, setHasHandledEnd] = useState(false);

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
      const newTime = roundToTwoDecimals((audio.currentTime / audio.duration) * 100);
      setPercentage(newTime || 0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, [isLocalPlaying, isDragging]);

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
    async function checkTrackEnd() {
      if (isLocalPlaying || !isTrackSet) return;

      const isTrackFinished = currentTime !== 0 && duration - currentTime <= 500;

      if (isTrackFinished && !hasHandledEnd) {
        setHasHandledEnd(true);

        if (isRepeat) {
          seekToSpotify(0);
        } else {
          await togglePlayPause();
          setIsPlaying(false);
          goToNextTrack();
        }
      }

      if (!isTrackFinished) setHasHandledEnd(false);
    }

    checkTrackEnd();
  }, [currentTime, duration, isRepeat, isPlaying]);

  useEffect(() => {
    if (!audioRef?.current) return;
    const audio = audioRef.current;
    audio.currentTime = 0;
    seekToSpotify(0);
    updateVolume(0);
  }, [currentIndex]);

  return (
    <>
      <div ref={barRef} className="player-controls__progress-bar--wrapper" onMouseDown={handleMouseDown}>
        {playDisable ? (
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
