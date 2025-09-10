import { create } from "zustand";

const useUploadModalStore = create((set) => ({
  isUploadModalVisible: false,

  showUploadModal: () => set({ isUploadModalVisible: true }),

  hideUploadModal: () => set({ isUploadModalVisible: false }),
}));

export default useUploadModalStore;
