import { createContext, useState, useContext, useEffect } from "react";
import { usePlayerContext } from "./PlayerContext";
import { TokenContext } from "./TokenContext";

export const PlaybackContext = createContext();

export const PlaybackProvider = ({ children, isTrackSet, queue, setQueue, currentIndex, setCurrentIndex }) => {
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [currentPlayedAt, setCurrentPlayedAt] = useState(null);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [currentTitle, setCurrentTitle] = useState("曲のタイトル");
  const [currentArtistName, setCurrentArtistName] = useState("アーティスト・作者名");
  const [currentCoverImage, setCurrentCoverImage] = useState("/img/fallback-cover.png");
  const { isToken } = useContext(TokenContext);
  const { playerTrack, setCurrentTime, setDuration, playDisable } = usePlayerContext();

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
        queue,
        setQueue,
        currentIndex,
        setCurrentIndex,

        updateCurrentIndex,
        goToNextTrack,
        goToPreviousTrack,
        isPrevDisabled,
        isNextDisabled,

        currentPlayedAt,
        setCurrentPlayedAt,

        currentTrackId,
        setCurrentTrackId,

        currentTitle,
        currentArtistName,
        currentCoverImage,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => useContext(PlaybackContext);
