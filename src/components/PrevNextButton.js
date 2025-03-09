// import React, { useEffect, useRef } from 'react';
// // import { useSongStore } from '../stores/songStore';
// import { usePlayerContext } from './PlayerContext';
// import { music, songs, playSong, loadSong } from './PlayMusic';

// const PrevNextButton = ({ type }) => {
//   const { isPlaying, currentSongIndex, setCurrentSongIndex } = usePlayerContext();

//   function playLoadSong() {
//     console.log(currentSongIndex);
//     if (isPlaying) {
//       playSong(currentSongIndex);
//     } else {
//       loadSong(currentSongIndex);
//     }
//   }

//   // const handlePrevNextClick = () => {
//   function handlePrevNextClick() {
//     if (type === 'prev') {
//       prevSong(); // 曲を変更
//     } else {
//       nextSong();
//     }
//     playLoadSong();
//   }

//   function prevSong() {
//     setCurrentSongIndex((prevIndex) => (prevIndex - 1 + songs.length) % songs.length);
//   }
//   function nextSong() {
//     setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
//   }

//   console.log(currentSongIndex);

//   return (
//     <button className="player-controls__button" onClick={handlePrevNextClick}>
//       {type === 'next' && <img src="img/next-icon.png" alt="Next" />}
//       {type === 'prev' && <img src="img/prev-icon.png" alt="Previous" />}
//     </button>
//   );
// };

// export default PrevNextButton;

import React, { useEffect, useRef } from 'react';
// import { useSongStore } from '../stores/songStore';
import { usePlayerContext } from './PlayerContext';
import { music, songs, playSong, loadSong } from './PlayMusic';

const PrevNextButton = ({ type }) => {
  const { isPlaying, currentSongIndex, setCurrentSongIndex } = usePlayerContext();

  function playLoadSong(index) {
    console.log(index);
    if (isPlaying) {
      playSong(index);
    } else {
      loadSong(index);
    }
  }

  // const handlePrevNextClick = () => {
  function handlePrevNextClick() {
    if (type === 'prev') {
      prevSong(); // 曲を変更
    } else {
      nextSong();
    }
    // playLoadSong();
  }

  function prevSong() {
    // setCurrentSongIndex((prevIndex) => (prevIndex - 1 + songs.length) % songs.length);
    setCurrentSongIndex((prevIndex) => {
      const newIndex = (prevIndex - 1 + songs.length) % songs.length;
      playLoadSong(newIndex);
      return newIndex;
    });
  }
  function nextSong() {
    // setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
    setCurrentSongIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % songs.length;
      playLoadSong(newIndex);
      return newIndex;
    });
  }

  // console.log(currentSongIndex);
  // console.log(currentSongIndexRef.current);

  return (
    <button className="player-controls__button" onClick={handlePrevNextClick}>
      {type === 'next' && <img src="img/next-icon.png" alt="Next" />}
      {type === 'prev' && <img src="img/prev-icon.png" alt="Previous" />}
    </button>
  );
};

export default PrevNextButton;

// import React, { useEffect, useRef } from 'react';
// import { usePlayerContext } from './PlayerContext';
// import { music, songs, playSong, loadSong } from './PlayMusic';

// const PrevNextButton = ({ type }) => {
//   const { isPlaying, currentSongIndex, setCurrentSongIndex } = usePlayerContext();

//   function playLoadSong() {
//     // if (!music.paused) return;
//     // music.paused ? console.log('停止中') : console.log('再生中');
//     console.log(currentSongIndex);
//     if (isPlaying) {
//       playSong(currentSongIndex);
//     } else {
//       loadSong(currentSongIndex);
//     }
//   }

//   function handlePrevNextClick() {
//     if (type === 'prev') {
//       prevSong(); // 曲を変更
//     } else {
//       nextSong();
//     }
//   }

//   function prevSong() {
//     setCurrentSongIndex((prevIndex) => {
//       const newIndex = (prevIndex - 1 + songs.length) % songs.length;
//       return newIndex;
//     });
//   }

//   function nextSong() {
//     setCurrentSongIndex((prevIndex) => {
//       const newIndex = (prevIndex + 1) % songs.length;
//       return newIndex;
//     });
//   }

//   useEffect(() => {
//     playLoadSong();
//   }, [currentSongIndex]);

//   return (
//     <button className="player-controls__button" onClick={handlePrevNextClick}>
//       {type === 'next' && <img src="img/next-icon.png" alt="Next" />}
//       {type === 'prev' && <img src="img/prev-icon.png" alt="Previous" />}
//     </button>
//   );
// };

// export default PrevNextButton;
