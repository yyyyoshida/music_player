import { useRef } from "react";
import useTooltipStore from "../store/tooltipStore";
import useTooltip from "../hooks/useTooltip";

const Tooltip = () => {
  const tooltipText = useTooltipStore((state) => state.tooltipText);
  const tooltipRef = useRef(null);
  const { correctedPosition, isTooltipVisible } = useTooltip(tooltipRef);

  return (
    <span
      ref={tooltipRef}
      className={`tooltip tooltip--${isTooltipVisible}`}
      style={{
        top: correctedPosition.y,
        left: correctedPosition.x,
      }}
    >
      {tooltipText}
    </span>
  );
};

export default Tooltip;
