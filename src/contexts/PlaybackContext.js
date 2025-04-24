import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { usePlayerContext } from '../components/PlayerContext';

export const PlaybackContext = createContext();

export const PlaybackProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [isNextDisabled, setIsNextDisabled] = useState(false);

  const currentIndexRef = useRef(0);

  const currentTrack = queue[currentIndex] || null;

  const { playerTrack, player } = usePlayerContext();

  useEffect(() => {
    console.log('一覧のトラック数', queue[0]);
  }, [queue]);

  // console.log(queue.length === 0);

  useEffect(() => {
    setIsPrevDisabled(currentIndexRef.current <= 0);
    setIsNextDisabled(currentIndexRef.current >= queue.length - 1);
  }, [queue, currentIndex]);

  // クリックしたトラックのインデックスをセット
  const playTrackAt = (index) => {
    if (index >= 0 && index < queue.length) {
      setCurrentIndex(index);
      currentIndexRef.current = index;
    }
  };

  useEffect(() => {
    console.log(currentIndexRef.current, 'これが現在の曲のインデックス');
  }, [currentIndex]);

  function goToNextTrack() {
    const nextIndex = currentIndexRef.current + 1;

    if (nextIndex < queue.length) {
      setCurrentIndex(nextIndex);
      currentIndexRef.current = nextIndex;
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
      playerTrack(queue[prevIndex].uri || queue[prevIndex].trackUri || queue[prevIndex].track.uri);
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
        currentTrack,
        playTrackAt,
        goToNextTrack,
        goToPreviousTrack,
        resumePlayback,
        isPrevDisabled,
        isNextDisabled,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => useContext(PlaybackContext);
