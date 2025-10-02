import { create } from "zustand";

type TrackMoreMenuStore = {
  trackMenuPositionTop: number;
  isTrackMenuVisible: boolean;
  menuTrackId: string | null;
  isTrackMenuButtonHovered: boolean;
  trackIndex: number | null;

  setTrackMenuPositionTop: (trackMenuPositionTop: number) => void;
  setMenuTrackId: (menuTrackId: string | null) => void;
  setIsTrackMenuButtonHovered: (isTrackMenuButtonHovered: boolean) => void;
  toggleTrackMenu: (index: number) => void;
  closeTrackMenu: () => void;
};

const useTrackMoreMenuStore = create<TrackMoreMenuStore>((set) => ({
  trackMenuPositionTop: 0,
  isTrackMenuVisible: false,
  menuTrackId: null,
  isTrackMenuButtonHovered: false,
  trackIndex: null,

  setTrackMenuPositionTop: (trackMenuPositionTop) => set({ trackMenuPositionTop }),
  setMenuTrackId: (menuTrackId) => set({ menuTrackId }),
  setIsTrackMenuButtonHovered: (isTrackMenuButtonHovered) =>
    set({ isTrackMenuButtonHovered }),

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
