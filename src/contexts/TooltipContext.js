import { createContext, useRef, useEffect } from "react";
import useTooltipStore from "../store/tooltipStore";

export const TooltipContext = createContext();

export const TooltipProvider = ({ children }) => {
  const setIsButtonPressed = useTooltipStore((state) => state.setIsButtonPressed);
  const setIsHovered = useTooltipStore((state) => state.setIsHovered);
  const setTooltipPosition = useTooltipStore((state) => state.setTooltipPosition);
  const hoverTimeout = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const delay = 600;

  function handleButtonPress() {
    setIsButtonPressed(true);
    setTimeout(() => {
      setIsButtonPressed(false);
    }, delay);
  }

  function handleMouseEnter() {
    hoverTimeout.current = setTimeout(() => {
      setTooltipPosition(mousePositionRef.current);

      setIsHovered(true);
    }, 500);
  }

  function handleMouseLeave() {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setTooltipPosition(null);
    setIsHovered(false);
  }

  useEffect(() => {
    function trackMousePosition(e) {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    }

    window.addEventListener("mousemove", trackMousePosition);
    return () => {
      window.removeEventListener("mousemove", trackMousePosition);
    };
  }, []);

  return (
    <TooltipContext.Provider
      value={{
        handleButtonPress,
        handleMouseEnter,
        handleMouseLeave,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
};

export default TooltipContext;
