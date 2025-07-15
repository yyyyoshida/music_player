import { useState, useEffect, useContext } from "react";
import { TooltipContext } from "../contexts/TooltipContext";

const Tooltip = () => {
  const [tooltipOpacity, setTooltipOpacity] = useState(0);
  const [tooltipVisibility, setTooltipVisibility] = useState("hidden");
  const { isHovered, isButtonPressed, className, isOpenMenu, tooltipPosition, tooltipText } = useContext(TooltipContext);

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
    console.log(isOpenMenu, "isOpenMenu");
  }, [isOpenMenu]);

  return (
    <>
      <span
        className={`tooltip ${className}`}
        style={{
          opacity: isOpenMenu ? 0 : tooltipOpacity,
          visibility: tooltipVisibility,
          // transition: isOpenMenu ? "all 0s" : "",
          // transition: isOpenMenu ? "all 2s" : "",

          top: tooltipPosition?.y + 18,
          left: tooltipPosition?.x + 12,
        }}
      >
        {tooltipText}
      </span>
    </>
  );
};

export default Tooltip;
