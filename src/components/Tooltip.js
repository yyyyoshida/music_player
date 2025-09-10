import { useState, useEffect, useRef } from "react";
import useTooltipStore from "../store/tooltipStore";

const Tooltip = () => {
  const [correctedPosition, setCorrectedPosition] = useState({ x: 0, y: 0 });
  const [tooltipOpacity, setTooltipOpacity] = useState(0);
  const [tooltipVisibility, setTooltipVisibility] = useState("hidden");

  const isButtonPressed = useTooltipStore((state) => state.isButtonPressed);
  const tooltipText = useTooltipStore((state) => state.tooltipText);
  const isHovered = useTooltipStore((state) => state.isHovered);
  const tooltipPosition = useTooltipStore((state) => state.tooltipPosition);
  const trackMousePosition = useTooltipStore((state) => state.trackMousePosition);

  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!tooltipPosition || !tooltipRef.current) return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const tooltipWidth = tooltipRef.current.getBoundingClientRect().width;
    const tooltipHeight = tooltipRef.current.getBoundingClientRect().height;

    const OFFSET_X = 12;
    const OFFSET_Y = 18;

    let x = tooltipPosition.x + OFFSET_X;
    let y = tooltipPosition.y + OFFSET_Y;

    // 右画面はみ出し防止
    if (x + tooltipWidth > screenWidth) x = screenWidth - tooltipWidth;

    // 下画面はみ出し防止
    if (y + tooltipHeight > screenHeight) y = screenHeight - tooltipHeight;

    setCorrectedPosition({ x, y });
  }, [tooltipPosition]);

  useEffect(() => {
    if (isButtonPressed) {
      setTooltipOpacity(0);
      setTooltipVisibility("hidden");
    } else if (isHovered) {
      setTooltipOpacity(1);
      setTooltipVisibility("visible");
    } else {
      setTooltipOpacity(0);
      setTooltipVisibility("hidden");
    }
  }, [isHovered, isButtonPressed]);

  useEffect(() => {
    window.addEventListener("mousemove", trackMousePosition);
    return () => {
      window.removeEventListener("mousemove", trackMousePosition);
    };
  }, []);

  return (
    <span
      ref={tooltipRef}
      className="tooltip"
      style={{
        // opacity: isOpenMenu ? 0 : tooltipOpacity,
        opacity: tooltipOpacity,
        visibility: tooltipVisibility,
        top: correctedPosition.y,
        left: correctedPosition.x,
      }}
    >
      {tooltipText}
    </span>
  );
};

export default Tooltip;
