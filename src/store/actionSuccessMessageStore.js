import { create } from "zustand";

const useActionSuccessMessageStore = create((set, get) => {
  const MESSAGE_SHOW_DURATION = 3000;

  return {
    isMessageVisible: false,
    actionType: "",

    setIsMessageVisible: (isMessageVisible) => set({ isMessageVisible }),
    setActionType: (actionType) => set({ actionType }),

    showMessage: (type) => {
      const { isMessageVisible } = get();
      let timerId;

      if (!isMessageVisible) {
        set({ actionType: type, isMessageVisible: true });

        timerId = setTimeout(() => {
          set({ isMessageVisible: false });
        }, MESSAGE_SHOW_DURATION);
      } else {
      }
    },
  };
});

export default useActionSuccessMessageStore;
