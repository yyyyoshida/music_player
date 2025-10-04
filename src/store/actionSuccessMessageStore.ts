import { create } from "zustand";

let timerId: ReturnType<typeof setTimeout>;

type ActionSuccessMessageStore = {
  isMessageVisible: boolean;
  actionType: string;

  setIsMessageVisible: (isMessageVisible: boolean) => void;
  setActionType: (actionType: string) => void;
  showMessage: (type: string) => void;
};

const useActionSuccessMessageStore = create<ActionSuccessMessageStore>((set, get) => {
  const MESSAGE_SHOW_DURATION = 3000;

  return {
    isMessageVisible: false,
    actionType: "",

    setIsMessageVisible: (isMessageVisible) => set({ isMessageVisible }),
    setActionType: (actionType) => set({ actionType }),

    showMessage: (type) => {
      const { isMessageVisible } = get();

      if (!isMessageVisible) {
        set({ actionType: type, isMessageVisible: true });

        timerId = setTimeout(() => {
          set({ isMessageVisible: false });
        }, MESSAGE_SHOW_DURATION);
      }
    },
  };
});

export default useActionSuccessMessageStore;
