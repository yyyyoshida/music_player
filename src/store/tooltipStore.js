import { create } from "zustand";

const useTooltipStore = create((set) => ({
  tooltipText: "",
  isButtonPressed: false,
  isHovered: false,
  tooltipPosition: null,

  setTooltipText: (tooltipText) => set({ tooltipText: tooltipText }),
  setIsButtonPressed: (isButtonPressed) => set({ isButtonPressed: isButtonPressed }),
  setIsHovered: (isHovered) => set({ isHovered: isHovered }),
  setTooltipPosition: (tooltipPosition) => set({ tooltipPosition: tooltipPosition }),
}));

export default useTooltipStore;
