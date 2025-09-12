import { createContext, useState, useContext, useEffect } from "react";
import usePlayerStore from "../store/playerStore";
import usePlaybackStore from "../store/playbackStore";
import { usePlayerContext } from "./PlayerContext";
import useTokenStore from "../store/tokenStore";

export const PlaybackContext = createContext();

export const PlaybackProvider = ({ children }) => {
  const queue = usePlaybackStore((state) => state.queue);
  const currentIndex = usePlaybackStore((state) => state.currentIndex);
  const setCurrentIndex = usePlaybackStore((state) => state.setCurrentIndex);
  const currentTrackId = usePlaybackStore((state) => state.currentTrackId);
  const setCurrentTrackId = usePlaybackStore((state) => state.setCurrentTrackId);
  const setCurrentTitle = usePlaybackStore((state) => state.setCurrentTitle);
  const setCurrentArtistName = usePlaybackStore((state) => state.setCurrentArtistName);
  const setCurrentCoverImage = usePlaybackStore((state) => state.setCurrentCoverImage);

  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const playDisable = usePlayerStore((state) => state.playDisable);
  const playerTrack = usePlayerStore((state) => state.playerTrack);
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const isToken = useTokenStore((state) => state.isToken);
  const { isTrackSet } = usePlayerContext();

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

  function setTrackIndex(index) {
    const isValidIndex = index >= 0 && index < queue.length;
    if (isValidIndex && index !== currentIndex) {
      setCurrentIndex(index);
    }
  }

  function updateTrackInfo(track) {
    if (!track) return;

    setCurrentTrackId(track.id);
    setCurrentArtistName(track.artist || track.artists?.[0]?.name);
    setCurrentTitle(track.title || track.name);
    setCurrentCoverImage(track.albumImage || track.album?.images?.[0]?.url);
    setCurrentTime(0);
    setDuration(0);
  }

  function playTrack(track) {
    if (!track || playDisable) return;
    const uriToPlay = track.uri || track.trackUri || track.audioURL;
    playerTrack(uriToPlay, track.source);
  }

  function updateCurrentIndex(index) {
    const track = queue[index];
    if (!track || index === currentIndex) return;

    updateTrackInfo(track);
    playTrack(track);
    setTrackIndex(index);
  }

  function goToNextTrack() {
    if (playDisable) return;
    const nextIndex = Math.min(currentIndex + 1, queue.length - 1);
    if (nextIndex !== currentIndex) {
      updateCurrentIndex(nextIndex);
    }
  }

  function goToPreviousTrack() {
    if (playDisable) return;
    const prevIndex = Math.max(currentIndex - 1, 0);
    if (prevIndex !== currentIndex) {
      updateCurrentIndex(prevIndex);
    }
  }

  return (
    <PlaybackContext.Provider
      value={{
        updateCurrentIndex,
        goToNextTrack,
        goToPreviousTrack,
        isPrevDisabled,
        isNextDisabled,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => useContext(PlaybackContext);
