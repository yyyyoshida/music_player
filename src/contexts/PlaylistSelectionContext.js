import { createContext, useEffect } from "react";
import { FALLBACK_COVER_IMAGE } from "../assets/icons";
import usePlaylistStore from "../store/playlistStore";
import usePlaylistSelectionStore from "../store/playlistSelectionStore";

export const PlaylistSelectionContext = createContext();

export const PlaylistSelectionProvider = ({ children }) => {
  const setPreselectedTrack = usePlaylistStore((state) => state.setPreselectedTrack);

  const selectedTrack = usePlaylistSelectionStore((state) => state.selectedTrack);

  useEffect(() => {
    setPreselectedTrack(selectedTrack);
  }, [selectedTrack]);

  return <PlaylistSelectionContext.Provider value={{}}>{children}</PlaylistSelectionContext.Provider>;
};

export default PlaylistSelectionContext;
