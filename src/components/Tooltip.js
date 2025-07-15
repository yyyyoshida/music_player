import { useState, useEffect, useContext, useRef } from "react";
import { TooltipContext } from "../contexts/TooltipContext";

const Tooltip = () => {
  const [correctedPosition, setCorrectedPosition] = useState({ x: 0, y: 0 });
  const [tooltipOpacity, setTooltipOpacity] = useState(0);
  const [tooltipVisibility, setTooltipVisibility] = useState("hidden");

  const { isHovered, isButtonPressed, className, isOpenMenu, tooltipPosition, tooltipText } = useContext(TooltipContext);
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

  return (
    <>
      <span
        ref={tooltipRef}
        className={`tooltip ${className}`}
        style={{
          opacity: isOpenMenu ? 0 : tooltipOpacity,
          visibility: tooltipVisibility,
          top: correctedPosition.y,
          left: correctedPosition.x,
        }}
      >
        {tooltipText}
      </span>
    </>
  );
};

export default Tooltip;
