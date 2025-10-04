import { useEffect } from "react";
import useTooltipStore from "../store/tooltipStore";

const useDelayedText = (isTrue: boolean, offText: string, onText: string): void => {
  const setTooltipText = useTooltipStore((state) => state.setTooltipText);

  useEffect(() => {
    setTooltipText(isTrue ? offText : onText);
  }, [isTrue]);
};

export default useDelayedText;
