import { create } from "zustand";

const usePlaylistSelectionStore = create((set) => ({
  isSelectVisible: false,
  selectedTrack: null,
  localCoverImageUrl: null,
  uploadTrackFile: null,

  setIsSelectVisible: (isSelectVisible) => set({ isSelectVisible }),
  setSelectedTrack: (selectedTrack) => set({ selectedTrack }),
  setLocalCoverImageUrl: (localCoverImageUrl) => set({ localCoverImageUrl }),
  setUploadTrackFile: (uploadTrackFile) => set({ uploadTrackFile }),
}));

export default usePlaylistSelectionStore;
