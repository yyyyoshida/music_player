import { create } from "zustand";

type UploadModalStore = {
  isUploadModalVisible: boolean;
  showUploadModal: () => void;
  hideUploadModal: () => void;
};

const useUploadModalStore = create<UploadModalStore>((set) => ({
  isUploadModalVisible: false,

  showUploadModal: () => set({ isUploadModalVisible: true }),
  hideUploadModal: () => set({ isUploadModalVisible: false }),
}));

export default useUploadModalStore;
