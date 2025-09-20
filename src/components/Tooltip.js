import { useRef } from "react";
import useTooltipStore from "../store/tooltipStore";
import useTooltip from "../hooks/useTooltip";

const Tooltip = () => {
  const tooltipText = useTooltipStore((state) => state.tooltipText);
  const tooltipRef = useRef(null);
  const { correctedPosition, tooltipOpacity, tooltipVisibility } = useTooltip(tooltipRef);

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
