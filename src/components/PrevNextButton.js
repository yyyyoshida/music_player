// import React, { useState, useEffect } from 'react';
// // import { music, songs, currentSongIndex, setCurrentSongIndex, playSong, loadSong } from './PlayMusic';
// import { music, songs, playSong, loadSong } from './PlayMusic';
// import { useSongStore } from '../stores/songStore';
// import PlayButton from './PlayButton';
// import { usePlayerContext } from './PlayerContext';

// const PrevNextButton = ({ type }) => {
//   const { currentSongIndex, nextSong, prevSong, setCurrentSongIndex } = useSongStore(); // store？を使ったやり方
//   const { isPlaying } = usePlayerContext();

//   const handlePrevNextClick = () => {
//     switch (type) {
//       case 'prev':
//         console.log(currentSongIndex);
//         if (isPlaying) {
//           playSong(currentSongIndex);
//         } else {
//           loadSong(currentSongIndex);
//         }
//         prevSong(currentSongIndex);
//         break;
//       case 'next':
//         console.log(currentSongIndex);
//         if (isPlaying) {
//           playSong(currentSongIndex);
//         } else {
//           loadSong(currentSongIndex);
//         }
//         nextSong(currentSongIndex);
//         break;
//     }
//   };

//   // const handlePrevClick = () => {
//   //   console.log(currentSongIndex);
//   //   if (isPlaying) {
//   //     playSong(currentSongIndex);
//   //   } else {
//   //     music.src = songs[currentSongIndex].path;
//   //     // loadSong(currentSongIndex);
//   //   }
//   //   prevSong(currentSongIndex);
//   // };
//   // const handleNextClick = () => {
//   //   console.log(currentSongIndex);
//   //   if (isPlaying) {
//   //     playSong(currentSongIndex);
//   //   } else {
//   //     music.src = songs[currentSongIndex].path;
//   //     // loadSong(currentSongIndex);
//   //   }
//   //   nextSong(currentSongIndex);
//   // };

//   return (
//     <button className="player-controls__button" onMouseDown={handlePrevNextClick}>
//       {type === 'next' && <img src="img/next-icon.png" alt="" />}
//       {type === 'prev' && <img src="img/prev-icon.png" alt="" />}
//     </button>
//     // <>
//     //   {type === 'prev' ? (
//     //     <button className="player-controls__button" onMouseDown={handlePrevClick}>
//     //       <img src="img/prev-icon.png" alt="Previous" />
//     //     </button>
//     //   ) : type === 'next' ? (
//     //     <button className="player-controls__button" onMouseDown={handleNextClick}>
//     //       <img src="img/next-icon.png" alt="Next" />
//     //     </button>
//     //   ) : null}
//     // </>
//   );
// };

// export default PrevNextButton;

import React, { useEffect } from 'react';
// import { useSongStore } from '../stores/songStore';
import { usePlayerContext } from './PlayerContext';
import { songs, playSong, loadSong } from './PlayMusic';

const PrevNextButton = ({ type }) => {
  const { isPlaying, currentSongIndex, setCurrentSongIndex } = usePlayerContext();
  // const { prevSong, nextSong, getState } = useSongStore(); // Zustandの getState を取得

  // if (isPlaying) {
  //   playSong(currentSongIndex);
  //   // playSong(newIndex);
  // } else {
  //   loadSong(currentSongIndex);
  //   // loadSong(newIndex);
  // }
  useEffect(() => {
    if (isPlaying) {
      // playSong(currentSongIndex);
    } else {
      loadSong(currentSongIndex);
    }
  }, [currentSongIndex, isPlaying]);
  // }, [currentSongIndex]);

  const handlePrevNextClick = () => {
    if (type === 'prev') {
      prevSong(); // 曲を変更
    } else {
      nextSong();
    }

    // ✅ 最新の currentSongIndex を取得
    // const newIndex = getState().currentSongIndex;

    // ✅ 最新の曲で再生 / 停止を処理
  };

  function prevSong() {
    setCurrentSongIndex((prevIndex) => (prevIndex - 1 + songs.length) % songs.length);
    // currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    console.log(currentSongIndex);
  }
  function nextSong() {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
    // currentSongIndex = (currentSongIndex + 1) % songs.length;
    console.log(currentSongIndex);
  }

  return (
    <button className="player-controls__button" onClick={handlePrevNextClick}>
      {type === 'next' && <img src="img/next-icon.png" alt="Next" />}
      {type === 'prev' && <img src="img/prev-icon.png" alt="Previous" />}
    </button>
  );
};

export default PrevNextButton;
