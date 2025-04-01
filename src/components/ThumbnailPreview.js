import React, { useContext, useRef, useState, useEffect } from 'react';
import { TrackInfoContext } from './TrackInfoContext';
import { songs, music } from './PlayMusic';
import { usePlayerContext } from './PlayerContext';

export const ThumbnailPreview = () => {
  const { isVisible } = useContext(TrackInfoContext);
  const { currentSongIndex, trackImage, trackTitle, trackArtistName } = usePlayerContext();

  const [delayedVisibility, setDelayedVisibility] = useState('hidden');
  const [title, setTitle] = useState('曲がセットされていません。');
  const [artist, setArtist] = useState('');
  const [scale, setScale] = useState(1);

  const thumbnailPreviewRef = useRef(null);
  const coverArtRef = useRef(null);
  const backgroundCoverArtRef = useRef('img/sarah-kilian-52jRtc2S_VE-unsplash.jpg');
  const transitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const dataArrayRef = useRef(null);

  function showThumbnail() {
    setDelayedVisibility('visible');
  }

  function hideThumbnailDelay() {
    const hideDelay = 300;
    const timer = setTimeout(() => {
      setDelayedVisibility('hidden');
    }, hideDelay);
    return () => clearTimeout(timer);
  }

  // TrackInfoの中のfadeTransition関数も同じだから今後使い回せるようにする。↓↓
  function fadeTransition() {
    // const transitionDelay = 500; // たまにtransitionのアニメーションが途切れる
    const transitionDelay = 50;
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
    }, transitionDelay);
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
    backgroundCoverArtRef.current.src = songs[currentSongIndex].cover;
    fadeTransition();
  }, [currentSongIndex]);

  // 曲に合わせて音楽の画像が動的に変化////////////////////////////////////////////

  function setupAudioContext() {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    }
  }

  function setupAudioSource() {
    if (!sourceRef.current) {
      sourceRef.current = audioContextRef.current.createMediaElementSource(music);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
  }

  function startAudioVisualization() {
    music.onplay = () => {
      audioContextRef.current.resume().then(() => {
        updateImageSize();
      });
    };
  }

  function updateImageSize() {
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    const average = sum / dataArrayRef.current.length;

    setScale(1 + average / 800);
    requestAnimationFrame(updateImageSize);
  }

  useEffect(() => {
    setupAudioContext();
    setupAudioSource();

    startAudioVisualization();
  }, []);

  return (
    <>
      <div
        ref={thumbnailPreviewRef}
        className={`thumbnail-preview ${isVisible ? 'is-visible' : ''}`}
        style={{ opacity: isVisible ? 1 : 0, visibility: delayedVisibility }}
      >
        <div
          ref={backgroundCoverArtRef}
          className="thumbnail-preview__background"
          // style={{ backgroundImage: `url(${backgroundCoverArtRef.current.src})` }}
          style={{ backgroundImage: `url(${trackImage})` }}
        ></div>
        <figure className="thumbnail-preview__content">
          <div className="thumbnail-preview__image-warpper" style={{ transform: `scale(${scale})` }}>
            {/* <img ref={coverArtRef} className="thumbnail-preview__image" src="img/not-found.jpg" alt="" /> */}
            <img ref={coverArtRef} className="thumbnail-preview__image" src={trackImage} alt="" />
            <div ref={transitionRef} className="thumbnail-preview__image-transition"></div>
          </div>
          <figcaption className="thumbnail-preview__info">
            <p className="thumbnail-preview__title">{trackTitle}</p>
            <p className="thumbnail-preview__artist">{trackArtistName}</p>
          </figcaption>
        </figure>
      </div>
    </>
  );
};
export default ThumbnailPreview;
