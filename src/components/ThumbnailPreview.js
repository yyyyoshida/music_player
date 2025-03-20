import React, { useContext, useRef, useState, useEffect } from 'react';
import { TrackInfoContext } from './TrackInfoContext';
import { songs, music } from './PlayMusic';
// import { songs } from '../components/PlayMusic';
import { usePlayerContext } from './PlayerContext';
import { useAudioVisualizer } from '../hooks/useAudioVisualizer';

export const ThumbnailPreview = () => {
  const { isVisible } = useContext(TrackInfoContext);
  const thumbnailPreviewRef = useRef(null);
  const [delayedVisibility, setDelayedVisibility] = useState('hidden');
  const { isPlaying, currentSongIndex } = usePlayerContext();
  const [title, setTitle] = useState('曲がセットされていません。');
  const [artist, setArtist] = useState('');
  const coverArtRef = useRef(null);
  const transitionRef = useRef(null);
  const scale = useAudioVisualizer();
  // const [scale, setScale] = useState(1);

  function showThumbnail() {
    setDelayedVisibility('visible');
  }

  function hideThumbnailDelay() {
    const timer = setTimeout(() => {
      setDelayedVisibility('hidden');
    }, 300);
    return () => clearTimeout(timer);
  }
  // TrackInfoの中のfadeTransition関数も同じだから今後使い回せるようにする。↓↓
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
  }

  useEffect(() => {
    if (isVisible) {
      showThumbnail();
    } else {
      hideThumbnailDelay();
    }
  }, [isVisible]);

  useEffect(() => {
    setTitle(songs[currentSongIndex].title);
    setArtist(songs[currentSongIndex].artist);
    coverArtRef.current.src = songs[currentSongIndex].cover;

    fadeTransition();
  }, [currentSongIndex]);

  // const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // const analyser = audioContext.createAnalyser();
  // const source = audioContext.createMediaElementSource(music);
  // source.connect(analyser);
  // analyser.connect(audioContext.destination);
  // analyser.fftSize = 256; // 周波数の解像度
  // const bufferLength = analyser.frequencyBinCount;
  // const dataArray = new Uint8Array(bufferLength);

  // function updateImageSize() {
  //   analyser.getByteFrequencyData(dataArray);

  //   let sum = 0;
  //   for (let i = 0; i < bufferLength; i++) {
  //     sum += dataArray[i];
  //   }
  //   const average = sum / bufferLength;
  //   // const scale = 1 + average / 800;
  //   setScale(1 + average / 800);
  //   requestAnimationFrame(updateImageSize);
  // }
  // music.onplay = () => {
  //   audioContext.resume().then(() => {
  //     updateImageSize();
  //   });
  // };

  return (
    <>
      <div
        ref={thumbnailPreviewRef}
        className={`thumbnail-preview ${isVisible ? 'is-visible' : ''}`}
        style={{ opacity: isVisible ? 1 : 0, visibility: delayedVisibility }}
      >
        <div className="thumbnail-preview__background" style={{ backgroundImage: `url(${songs[currentSongIndex].cover})` }}></div>
        <figure className="thumbnail-preview__content">
          {/* <div className="thumbnail-preview__image-warpper"> */}
          <div className="thumbnail-preview__image-warpper" style={{ transform: `scale(${scale})` }}>
            <img ref={coverArtRef} className="thumbnail-preview__image" src="img/not-found.jpg" alt="" />
            <div ref={transitionRef} className="thumbnail-preview__image-transition"></div>
          </div>
          <figcaption className="thumbnail-preview__info">
            <p className="thumbnail-preview__title">{title}</p>
            <p className="thumbnail-preview__artist">{artist}</p>
          </figcaption>
        </figure>
      </div>
    </>
  );
};
export default ThumbnailPreview;
