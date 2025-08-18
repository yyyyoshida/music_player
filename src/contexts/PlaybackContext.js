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
  const { isToken, setIsToken } = useContext(TokenContext);
  const { playerTrack, player, setCurrentTime, setDuration, playDisable } = usePlayerContext();

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

  // クリックしたトラックのインデックスをセット
  function updateCurrentIndex(index) {
    const isValidIndex = index >= 0 && index < queue.length;
    const isDifferentTrack = index !== currentIndex;

    if (isValidIndex && isDifferentTrack) {
      setCurrentIndex(index);
      playTrackAtIndex(index);
    }
  }

  useEffect(() => {
    const track = queue[currentIndex];
    if (!track) return;

    const isClickedTrack = track.id === currentTrackId;
    if (!isClickedTrack) return;

    setCurrentArtistName(queue[currentIndex].artist || queue[currentIndex].artists[0].name);
    setCurrentTitle(queue[currentIndex].title || queue[currentIndex].name);
    setCurrentCoverImage(queue[currentIndex].albumImage || queue[currentIndex].album.images[0].url);
  }, [currentIndex, queue, currentTrackId]);

  function playTrackAtIndex(index) {
    if (playDisable) return;

    const track = queue[index];
    if (!track) return;

    const uriToPlay = track.uri || track.trackUri || track.audioURL;
    setCurrentTrackId(track.id);

    playerTrack(uriToPlay, track.source);
  }

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [currentIndex]);

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

  function resumePlayback() {
    player.resume().then(() => {});
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
        resumePlayback,
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
