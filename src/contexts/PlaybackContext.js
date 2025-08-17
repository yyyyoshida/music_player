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
  const { playerTrack, player, setCurrentTime, setDuration } = usePlayerContext();

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
  const updateCurrentIndex = (index) => {
    if (index >= 0 && index < queue.length) {
      setCurrentIndex(index);
    }
  };

  useEffect(() => {
    const track = queue[currentIndex];
    if (!track) return;

    const isClickedTrack = track.id === currentTrackId;

    if (!isClickedTrack) return;

    setCurrentArtistName(queue[currentIndex].artist || queue[currentIndex].artists[0].name);
    setCurrentTitle(queue[currentIndex].title || queue[currentIndex].name);
    setCurrentCoverImage(queue[currentIndex].albumImage || queue[currentIndex].album.images[0].url);
  }, [currentIndex, queue, currentTrackId]);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [currentIndex]);

  function playTrackAtIndex(index) {
    const track = queue[index];
    if (!track) return;

    const uriToPlay = track.uri || track.trackUri || track.audioURL;
    setCurrentTrackId(track.id);
    playerTrack(uriToPlay, track.source);
  }

  function goToNextTrack() {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < queue.length) {
        playTrackAtIndex(nextIndex);
        return nextIndex;
      }
      return prevIndex;
    });
  }

  function goToPreviousTrack() {
    setCurrentIndex((prevIndex) => {
      const prev = prevIndex - 1;
      if (prev >= 0) {
        playTrackAtIndex(prev);
        return prev;
      }
      return prevIndex;
    });
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
