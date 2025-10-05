import { create } from "zustand";

type TooltipStore = {
  tooltipText: string;
  isButtonPressed: boolean;
  isHovered: boolean;
  tooltipPosition: { x: number; y: number } | null;

  setTooltipText: (tooltipText: string) => void;
  setIsButtonPressed: (isButtonPressed: boolean) => void;
  setIsHovered: (isHovered: boolean) => void;
  setTooltipPosition: (tooltipPosition: { x: number; y: number } | null) => void;
  handleButtonPress: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  trackMousePosition: (e: MouseEvent) => void;
};

let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

const useTooltipStore = create<TooltipStore>((set) => {
  let mousePosition = { x: 0, y: 0 };
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
      hoverTimeout = setTimeout(() => {
        set({ tooltipPosition: mousePosition, isHovered: true });
      }, TOOLTIP_SHOW_DELAY);
    },

    handleMouseLeave: () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }

      set({ tooltipPosition: null, isHovered: false });
    },

    trackMousePosition: (e: MouseEvent) => {
      mousePosition = { x: e.clientX, y: e.clientY };
    },
  };
});

export default useTooltipStore;
