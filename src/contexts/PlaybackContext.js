import { createContext, useState, useContext, useEffect, useRef } from "react";
import { usePlayerContext } from "./PlayerContext";
import { TokenContext } from "../contexts/isTokenContext";

export const PlaybackContext = createContext();

export const PlaybackProvider = ({ children, isTrackSet, queue, setQueue, currentIndex, setCurrentIndex }) => {
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [currentPlayedAt, setCurrentPlayedAt] = useState(null);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const { isToken, setIsToken } = useContext(TokenContext);

  const currentIndexRef = useRef(0);

  // const currentTrack = queue[currentIndex] || null;

  const { playerTrack, player } = usePlayerContext();

  useEffect(() => {
    console.log("一覧のトラック数", queue);
  }, [queue]);

  // console.log(queue.length === 0);

  useEffect(() => {
    if (!isToken) return;
    console.log(!isTrackSet);

    if (!isTrackSet) {
      setIsPrevDisabled(!isTrackSet);
      setIsNextDisabled(!isTrackSet);
      return;
    }

    console.log(!isTrackSet);
    setIsPrevDisabled(currentIndexRef.current <= 0);
    setIsNextDisabled(currentIndexRef.current >= queue.length - 1);
  }, [queue, currentIndex, isTrackSet]);

  // こいつ原因です

  // クリックしたトラックのインデックスをセット
  const playTrackAt = (index) => {
    console.log("発火");
    if (index >= 0 && index < queue.length) {
      setCurrentIndex(index);

      currentIndexRef.current = index;
    }
  };

  useEffect(() => {
    console.log(currentIndexRef.current, "これが現在の曲のインデックス");
  }, [currentIndex]);

  function goToNextTrack() {
    const nextIndex = currentIndexRef.current + 1;

    if (nextIndex < queue.length) {
      setCurrentIndex(nextIndex);
      currentIndexRef.current = nextIndex;
      setCurrentTrackId(queue[nextIndex].id);

      // setCurrentTrackId(queue[nextIndex].id || queue[nextIndex].track.id);
      playerTrack(queue[nextIndex].uri || queue[nextIndex].trackUri || queue[nextIndex].track.uri);
    } else {
    }
  }

  function goToPreviousTrack() {
    const prevIndex = currentIndexRef.current - 1;

    if (prevIndex >= 0) {
      console.log(prevIndex >= 0);
      setCurrentIndex(prevIndex);
      currentIndexRef.current = prevIndex;
      setCurrentTrackId(queue[prevIndex].id);

      // setCurrentTrackId(queue[prevIndex].id || queue[prevIndex].track.id);
      playerTrack(queue[prevIndex].uri || queue[prevIndex].trackUri || queue[prevIndex].track.uri);
    }
  }

  function resumePlayback() {
    player.resume().then(() => {});
  }

  useEffect(() => {
    console.log(currentPlayedAt);
  }, [currentPlayedAt]);

  useEffect(() => {
    console.log(currentIndex);
  }, [currentIndex]);

  return (
    <PlaybackContext.Provider
      value={{
        queue,
        setQueue,
        currentIndex,
        setCurrentIndex,
        // currentTrack,
        playTrackAt,
        goToNextTrack,
        goToPreviousTrack,
        resumePlayback,
        isPrevDisabled,
        isNextDisabled,

        currentPlayedAt,
        setCurrentPlayedAt,

        currentTrackId,
        setCurrentTrackId,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => useContext(PlaybackContext);
