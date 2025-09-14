import { create } from "zustand";

const useRepeatStore = create((set) => ({
  isRepeat: false,

  toggleRepeat: () => {
    set((state) => ({ isRepeat: !state.isRepeat }));
  },
}));

export default useRepeatStore;
