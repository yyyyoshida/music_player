import { useState, useEffect } from "react";
import usePlayerStore from "../store/playerStore";

export default function useBarHandler({ type, initialVolume = 0, barRef, handleVolumeChange }) {
  const isVolumeType = type === "volume";
  const isProgressType = type === "progress";

  const isLocalPlaying = usePlayerStore((state) => state.isLocalPlaying);
  const isLocalReady = usePlayerStore((state) => state.isLocalReady);

  const [percentage, setPercentage] = useState(() => {
    const saved = localStorage.getItem("player_volume");

    if (saved === null) return initialVolume;
    return parseInt(saved);
  });
  const [isDragging, setIsDragging] = useState(false);

  function roundToTwoDecimals(value) {
    return parseFloat(value.toFixed(2));
  }

  function handleClickBar(e) {
    if (isLocalPlaying && !isLocalReady) return;

    const barRect = barRef?.current.getBoundingClientRect();
    const clickX = e?.clientX - barRect?.left;
    const newPercentage = roundToTwoDecimals((clickX / barRect?.width) * 100);

    if (isProgressType) return setPercentage(newPercentage);
    if (isVolumeType) handleVolumeChange(newPercentage);
  }

  function handleMouseDown(e) {
    setIsDragging(true);
    handleClickBar(e);
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  // 備忘録　ドラッグ中にバーの位置を％で計算して見た目だけ反映させる（実際の音量やシークは別処理）
  function handleDrag(e) {
    if (!isDragging) return;
    if (isProgressType && isLocalPlaying && !isLocalReady) return;

    const barRect = barRef.current.getBoundingClientRect();
    const moveX = e.clientX - barRect.left;
    const newPercentage = roundToTwoDecimals(Math.min(Math.max((moveX / barRect.width) * 100, 0), 100));

    if (isProgressType) return setPercentage(newPercentage);
    if (isVolumeType) handleVolumeChange(newPercentage);
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

  return {
    percentage,
    setPercentage,
    isDragging,
    roundToTwoDecimals,
    handleMouseUp,
    handleMouseDown,
    handleDrag,
  };
}
