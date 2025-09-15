import { createContext, useState, useContext, useEffect } from "react";
import usePlayerStore from "../store/playerStore";
import usePlaybackStore from "../store/playbackStore";
import useTokenStore from "../store/tokenStore";

export const PlaybackContext = createContext();

export const PlaybackProvider = ({ children }) => {
  const queue = usePlaybackStore((state) => state.queue);
  const currentIndex = usePlaybackStore((state) => state.currentIndex);
  const currentTrackId = usePlaybackStore((state) => state.currentTrackId);
  const updateTrackInfo = usePlaybackStore((state) => state.updateTrackInfo);

  const isTrackSet = usePlayerStore((state) => state.isTrackSet);

  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const isToken = useTokenStore((state) => state.isToken);

  useEffect(() => {
    if (!isToken) return;

    if (!isTrackSet) {
      setIsPrevDisabled(!isTrackSet);
      setIsNextDisabled(!isTrackSet);
      return;
    }

    setIsPrevDisabled(currentIndex <= 0);
    setIsNextDisabled(currentIndex >= queue.length - 1);
  }, [queue, currentIndex, isTrackSet]);

  useEffect(() => {
    const track = queue[currentIndex];
    if (!track) return;

    const isClickedTrack = track.id === currentTrackId;
    if (!isClickedTrack) return;

    updateTrackInfo(track);
  }, [queue, currentIndex, currentTrackId]);

  return (
    <PlaybackContext.Provider
      value={{
        isPrevDisabled,
        isNextDisabled,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => useContext(PlaybackContext);
