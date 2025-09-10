import { create } from "zustand";

const useTrackMoreMenuStore = create((set) => ({
  trackMenuPositionTop: 0,
  isTrackMenuVisible: false,
  menuTrackId: null,
  isTrackMenuButtonHovered: false,
  trackIndex: null,

  setTrackMenuPositionTop: (trackMenuPositionTop) => set({ trackMenuPositionTop }),
  setMenuTrackId: (menuTrackId) => set({ menuTrackId }),
  setIsTrackMenuButtonHovered: (isTrackMenuButtonHovered) => set({ isTrackMenuButtonHovered }),

  toggleTrackMenu: (index) => {
    set((state) => {
      if (state.trackIndex !== index) {
        return { trackIndex: index, isTrackMenuVisible: true };
      }

      return { isTrackMenuVisible: !state.isTrackMenuVisible };
    });
  },

  closeTrackMenu: () => {
    set({ isTrackMenuVisible: false });
  },
}));

export default useTrackMoreMenuStore;
