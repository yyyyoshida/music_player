import { useEffect } from "react";
import useTooltipStore from "../store/tooltipStore";

const useDelayedText = (isTrue, offText, onText) => {
  const setTooltipText = useTooltipStore((state) => state.setTooltipText);

  useEffect(() => {
    setTooltipText(isTrue ? offText : onText);
  }, [isTrue]);
};

export default useDelayedText;
