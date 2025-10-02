import { create } from "zustand";

type RepeatStore = {
  isRepeat: boolean;
  toggleRepeat: () => void;
};

const useRepeatStore = create<RepeatStore>((set) => ({
  isRepeat: false,

  toggleRepeat: () => {
    set((state) => ({ isRepeat: !state.isRepeat }));
  },
}));

export default useRepeatStore;
