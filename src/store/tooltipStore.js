import { create } from "zustand";

const useTooltipStore = create((set) => {
  const hoverTimeoutRef = { current: null };
  const mousePositionRef = { current: { x: 0, y: 0 } };
  const TOOLTIP_SHOW_DELAY = 500;
  const BUTTON_PRESS_DELAY = 600;

  return {
    tooltipText: "",
    isButtonPressed: false,
    isHovered: false,
    tooltipPosition: null,

    setTooltipText: (tooltipText) => set({ tooltipText }),
    setIsButtonPressed: (isButtonPressed) => set({ isButtonPressed }),
    setIsHovered: (isHovered) => set({ isHovered }),
    setTooltipPosition: (tooltipPosition) => set({ tooltipPosition }),

    handleButtonPress: () => {
      set({ isButtonPressed: true });
      setTimeout(() => {
        set({ isButtonPressed: false });
      }, BUTTON_PRESS_DELAY);
    },

    handleMouseEnter: () => {
      hoverTimeoutRef.current = setTimeout(() => {
        set({ tooltipPosition: mousePositionRef.current, isHovered: true });
      }, TOOLTIP_SHOW_DELAY);
    },

    handleMouseLeave: () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }

      set({ tooltipPosition: null, isHovered: false });
    },

    trackMousePosition: (e) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    },
  };
});

export default useTooltipStore;
