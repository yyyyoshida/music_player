import { create } from "zustand";

export type ActionType =
  | "add"
  | "addFailed"
  | "addFailedSpotify"
  | "addFailedLocal"
  | "addFailedNewLocal"
  | "deleteTrack"
  | "deleteTrackFailed"
  | "deletePlaylist"
  | "deletePlaylistFailed"
  | "fetchPlaylistsFailed"
  | "fetchPlaylistInfoFailed"
  | "fetchPlaylistDetailFailed"
  | "fetchProfileFailed"
  | "newPlaylist"
  | "newPlaylistFailed"
  | "rename"
  | "renameFailed"
  | "deviceNotFound"
  | "tokenExpired"
  | "playFailed"
  | "tooFrequent"
  | "searchFailed"
  | "unselected"
  | "未実装";

type ActionSuccessMessageStore = {
  isMessageVisible: boolean;
  actionType: ActionType;
  timerId: ReturnType<typeof setTimeout> | null;

  setIsMessageVisible: (isMessageVisible: boolean) => void;
  setActionType: (actionType: ActionType) => void;
  showMessage: (type: ActionType) => void;
};

const useActionSuccessMessageStore = create<ActionSuccessMessageStore>((set, get) => {
  const MESSAGE_SHOW_DURATION = 3000;

  return {
    isMessageVisible: false,
    actionType: "unselected",
    timerId: null,

    setIsMessageVisible: (isMessageVisible) => set({ isMessageVisible }),
    setActionType: (actionType) => set({ actionType }),
    showMessage: (type) => {
      const { isMessageVisible } = get();

      if (!isMessageVisible) {
        set({ actionType: type, isMessageVisible: true });

        const id = setTimeout(() => {
          set({ isMessageVisible: false });
          set({ timerId: null });
        }, MESSAGE_SHOW_DURATION);

        set({ timerId: id });
      }
    },
  };
});

export default useActionSuccessMessageStore;
