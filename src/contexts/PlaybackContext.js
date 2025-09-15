import { createContext, useContext, useEffect } from "react";
import usePlayerStore from "../store/playerStore";
import usePlaybackStore from "../store/playbackStore";
import useTokenStore from "../store/tokenStore";

export const PlaybackContext = createContext();

export const PlaybackProvider = ({ children }) => {
  const queue = usePlaybackStore((state) => state.queue);
  const currentIndex = usePlaybackStore((state) => state.currentIndex);
  const currentTrackId = usePlaybackStore((state) => state.currentTrackId);
  const updateTrackInfo = usePlaybackStore((state) => state.updateTrackInfo);
  const setIsPrevDisabled = usePlaybackStore((state) => state.setIsPrevDisabled);
  const setIsNextDisabled = usePlaybackStore((state) => state.setIsNextDisabled);

  const isTrackSet = usePlayerStore((state) => state.isTrackSet);

  const isToken = useTokenStore((state) => state.isToken);

  // useEffect(() => {
  //   if (!isToken) return;

  //   if (!isTrackSet) {
  //     setIsPrevDisabled(!isTrackSet);
  //     setIsNextDisabled(!isTrackSet);
  //     return;
  //   }

  //   setIsPrevDisabled(currentIndex <= 0);
  //   setIsNextDisabled(currentIndex >= queue.length - 1);
  // }, [queue, currentIndex, isTrackSet]);

  return <PlaybackContext.Provider value={{}}>{children}</PlaybackContext.Provider>;
};

export const usePlayback = () => useContext(PlaybackContext);
