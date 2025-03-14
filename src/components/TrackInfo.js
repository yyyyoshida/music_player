import React, { useState, useEffect, useRef } from 'react';
import { music, songs, playSong } from './PlayMusic';
import { usePlayerContext } from './PlayerContext';

const TrackInfo = () => {
  const [title, setTitle] = useState('曲のタイトル');
  const [artist, setArtist] = useState('アーティスト・作者');
  const imgRef = useRef(null);
  const [isHidden, setIsHidden] = useState(false);
  const { isPlaying, currentSongIndex } = usePlayerContext();
  const isFirstRender = useRef(true);
  const transitionRef = useRef(null);
  const prevSongIndex = useRef(null);

  function fadeTransition() {
    const transitionElement = transitionRef.current;
    transitionElement.style.visibility = 'visible';
    transitionElement.style.opacity = 1;
    function handleTransitionEnd() {
      transitionElement.style.visibility = 'hidden';
      transitionElement.style.opacity = 1;
    }
    setTimeout(() => {
      transitionElement.style.opacity = 0;
      transitionElement.addEventListener('transitionend', handleTransitionEnd);
    }, 50);
    // }, 100);
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (prevSongIndex.current !== currentSongIndex) {
      fadeTransition();
    }
    prevSongIndex.current = currentSongIndex;

    setTitle(songs[currentSongIndex].title);
    setArtist(songs[currentSongIndex].artist);
    imgRef.current.src = songs[currentSongIndex].cover;

    setIsHidden(true);
  }, [currentSongIndex, isPlaying]);

  return (
    <>
      <div id="js-track-info" className="player-controls__track-info">
        <figure className="player-controls__track">
          <div id="js-track-thumbnail-wrapper" className="player-controls__track-thumbnail-wrapper">
            <img
              ref={imgRef}
              id="js-track-thumbnail"
              src={'img/写真アイコン4.png'}
              alt="サムネイル"
              className="player-controls__track-thumbnail"
            />
            <div
              ref={transitionRef}
              className="player-controls__track-thumbnail-transition"
              style={{ visibility: isHidden ? 'hidden' : 'visible' }}
            ></div>
          </div>
          <figcaption id="js-track-meta" className="player-controls__track-meta">
            <p className="player-controls__title">{title}</p>
            <p className="player-controls__artist">{artist}</p>
          </figcaption>
        </figure>
      </div>
    </>
  );
};

export default TrackInfo;
