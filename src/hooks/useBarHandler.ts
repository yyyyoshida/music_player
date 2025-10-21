import { useState, useEffect } from "react";
import usePlayerStore from "../store/playerStore";
import { STORAGE_KEYS } from "../utils/storageKeys";

type BarHandlerProps = {
  type: "progress" | "volume";
  initialValue?: number;
  barRef: React.RefObject<HTMLDivElement | null>;
  handleVolumeChange?: (newPercentage: number) => void;
};

export default function useBarHandler({
  type,
  initialValue = 0,
  barRef,
  handleVolumeChange,
}: BarHandlerProps) {
  const isVolumeType = type === "volume";
  const isProgressType = type === "progress";

  const isLocalPlaying = usePlayerStore((state) => state.isLocalPlaying);
  const isLocalReady = usePlayerStore((state) => state.isLocalReady);

  const [percentage, setPercentage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VOLUME);

    if (saved === null) return initialValue;
    return parseInt(saved);
  });
  const [isDragging, setIsDragging] = useState(false);

  function roundToTwoDecimals(value: number): number {
    return parseFloat(value.toFixed(2));
  }

  function handleClickBar(e: React.MouseEvent<HTMLDivElement>): number | void {
    if (isLocalPlaying && !isLocalReady) return;

    const barRect = barRef.current?.getBoundingClientRect();
    if (!barRect) return;
    const clickX = e?.clientX - barRect?.left;
    const newPercentage = roundToTwoDecimals((clickX / barRect?.width) * 100);

    if (isProgressType) return setPercentage(newPercentage);
    if (isVolumeType && handleVolumeChange) handleVolumeChange(newPercentage);
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>): void {
    setIsDragging(true);
    handleClickBar(e);
  }

  function handleMouseUp(): void {
    setIsDragging(false);
  }

  // 備忘録　ドラッグ中にバーの位置を％で計算して見た目だけ反映させる（実際の音量やシークは別処理）
  function handleDrag(e: MouseEvent): void {
    if (!isDragging) return;
    if (isProgressType && isLocalPlaying && !isLocalReady) return;

    const barRect = barRef.current?.getBoundingClientRect();
    if (!barRect) return;
    const moveX = e.clientX - barRect.left;
    const newPercentage = roundToTwoDecimals(Math.min(Math.max((moveX / barRect.width) * 100, 0), 100));

    if (isProgressType) return setPercentage(newPercentage);
    if (isVolumeType && handleVolumeChange) handleVolumeChange(newPercentage);
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
