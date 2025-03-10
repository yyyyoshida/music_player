import React, { useState, useEffect, useRef } from 'react';
import { music, songs, playSong } from './PlayMusic';
import { usePlayerContext } from './PlayerContext';

const TrackInfo = () => {
  const [title, setTitle] = useState('曲のタイトル');
  const [artist, setArtist] = useState('アーティスト・作者');
  // const [thumbnail, setThumbnail] = useState('');
  const imgRef = useRef(null);
  // const [isHidden, setIsHidden] = useState('visible');
  const { isPlaying, currentSongIndex } = usePlayerContext();
  const isFirstRender = useRef(true);

  // useEffect(() => {
  //   if (isFirstRender.current) {
  //     return;
  //   }
  //   setIsHidden('hidden');
  // }, [isPlaying, currentSongIndex]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setTitle(songs[currentSongIndex].title);
    setArtist(songs[currentSongIndex].artist);
    imgRef.current.src = songs[currentSongIndex].cover;
  }, [currentSongIndex, isPlaying]);

  return (
    <>
      <div id="js-track-info" className="player-controls__track-info">
        <figure className="player-controls__track">
          <div id="js-track-thumbnail-wrapper" className="player-controls__track-thumbnail-wrapper">
            {/* <img id="js-track-thumbnail" src="img/写真アイコン4.png" alt="サムネイル" className="player-controls__track-thumbnail" /> */}
            <img
              ref={imgRef}
              id="js-track-thumbnail"
              src={'img/写真アイコン4.png'}
              // src={thumbnail || 'img/写真アイコン4.png'}
              // src={`${thumbnail}`}
              alt="サムネイル"
              // alt={title}
              className="player-controls__track-thumbnail"
            />
            <div
              id="js-track-thumbnail-transition"
              className="player-controls__track-thumbnail-transition"
              // style={{ visibility: isHidden ? 'visible' : 'hidden' }}
              // style={{ visibility: isHidden ? 'hidden' : 'visible' }}
              // style={{ visibility: isHidden }}
              style={{ visibility: 'hidden' }}
            ></div>
          </div>
          <figcaption id="js-track-meta" className="player-controls__track-meta">
            {/* 根本的解決にはならないが、最初に表示されるバグを一次的にこれで解消↓↓ */}
            {/* <p style={{ visibility: isHidden ? 'hidden' : 'visible' }} className="player-controls__title"> */}
            <p className="player-controls__title">{title}</p>
            {/* <p style={{ visibility: isHidden ? 'hidden' : 'visible' }} className="player-controls__artist"> */}
            <p className="player-controls__artist">{artist}</p>
          </figcaption>
        </figure>
      </div>
    </>
  );
};

export default TrackInfo;
