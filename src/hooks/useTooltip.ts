import { useState, useEffect } from "react";
import useTooltipStore from "../store/tooltipStore";

type UseTooltipReturn = {
  correctedPosition: { x: number; y: number };
  isTooltipVisible: "visible" | "hidden";
};

const useTooltip = (tooltipRef: React.RefObject<HTMLSpanElement | null>): UseTooltipReturn => {
  const [correctedPosition, setCorrectedPosition] = useState({ x: 0, y: 0 });

  const isButtonPressed = useTooltipStore((state) => state.isButtonPressed);
  const isHovered = useTooltipStore((state) => state.isHovered);
  const tooltipPosition = useTooltipStore((state) => state.tooltipPosition);
  const trackMousePosition = useTooltipStore((state) => state.trackMousePosition);

  const isTooltipVisible = isHovered && !isButtonPressed ? "visible" : "hidden";

  const OFFSET_X = 12;
  const OFFSET_Y = 18;

  useEffect(() => {
    if (!tooltipPosition || !tooltipRef.current) return;

    let x = tooltipPosition.x + OFFSET_X;
    let y = tooltipPosition.y + OFFSET_Y;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const tooltipWidth = tooltipRef.current.getBoundingClientRect().width;
    const tooltipHeight = tooltipRef.current.getBoundingClientRect().height;

    // 右画面はみ出し防止
    if (x + tooltipWidth > screenWidth) x = screenWidth - tooltipWidth;

    // 下画面はみ出し防止
    if (y + tooltipHeight > screenHeight) y = screenHeight - tooltipHeight;

    setCorrectedPosition({ x, y });
  }, [tooltipPosition]);

  useEffect(() => {
    window.addEventListener("mousemove", trackMousePosition);
    return () => {
      window.removeEventListener("mousemove", trackMousePosition);
    };
  }, [trackMousePosition]);

  return {
    correctedPosition,
    isTooltipVisible,
  };
};

export default useTooltip;
