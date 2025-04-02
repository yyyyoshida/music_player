// import React, { useState, useEffect, useLayoutEffect, useRef, useContext } from 'react';
// import { music, songs, playSong } from './PlayMusic';
// import { usePlayerContext } from './PlayerContext';
// // import { debounce } from 'lodash';
// import { throttle } from 'lodash';
// import { TrackInfoContext } from './TrackInfoContext';

// const TrackInfo = ({ actionsRef }) => {
//   // const [title, setTitle] = useState('曲のタイトル');
//   // const [title, setTitle] = useState('123456789123456789123456789123456789123456789123456789123456789');
//   const [title, setTitle] = useState('123456789123456789123456789123456789123456789123456789');
//   const [artist, setArtist] = useState('アーティスト・作者');
//   const imgRef = useRef(null);
//   const [isHidden, setIsHidden] = useState(false);
//   const { isPlaying, currentSongIndex } = usePlayerContext();
//   const isFirstRender = useRef(true);
//   const transitionRef = useRef(null);
//   const prevSongIndex = useRef(null);
//   // トラックの抜粋機能↓↓
//   const trackInfoRef = useRef(null);
//   const trackMetaRef = useRef(null);

//   // const [width, setWidth] = useState(231);
//   const [width, setWidth] = useState(85);

//   const [originalTextArray, setOriginalTextArray] = useState([]);
//   const [removedCount, setRemovedCount] = useState(0);
//   // const [isRestoring, setIsRestoring] = useState(false);

//   const [isCollision, setIsCollision] = useState(false);

//   const [trackTitle, setTrackElement] = useState(null);
//   const titleRef = useRef(title);

//   const [curWidth, setCurWidth] = useState(null);

//   const isCollisionRef = useRef(null);

//   const [expandScreenSize, setExpandScreenSize] = useState(window.innerWidth);
//   const [shrinkScreenSize, setShrinkScreenSize] = useState(window.innerWidth);

//   const [triggerEffect, setTriggerEffect] = useState(false);

//   const [trimmedTitle, setTrimmedTitle] = useState(title);

//   // const [untrimmedTitle, setUntrimmedTitle] = useState(songs[currentSongIndex].title);
//   const untrimmedTitleRef = useRef(songs[currentSongIndex].title);

//   // const [isVisible, setIsVisible] = useState(false);
//   const { handleTrackInfoClick, isVisible } = useContext(TrackInfoContext);

//   // const [trackTitle, setTrackElement] = useState(trackMetaRef.current.firstElementChild);

//   let previousWidth = window.innerWidth;

//   const handleResize = throttle(() => {
//     const currentWidth = window.innerWidth;
//     if (currentWidth > previousWidth) {
//       // 画面拡大
//       // setCurWidth(currentWidth);
//       setExpandScreenSize(currentWidth);
//       restoreTrackTitle();
//     } else if (currentWidth < previousWidth) {
//       setCurWidth(currentWidth);
//       setShrinkScreenSize(currentWidth);
//       // 画面縮小
//     }
//     previousWidth = currentWidth;
//     // }, 100); // 200msの遅延でイベントをまとめて処理
//   }, 10); // 200msの遅延でイベントをまとめて処理

//   useEffect(() => {
//     window.addEventListener('resize', handleResize);

//     return () => {
//       window.removeEventListener('resize', handleResize);
//     };
//   }, [currentSongIndex]);

//   useLayoutEffect(() => {
//     // setTimeout(() => {
//     //   if (!trackInfoRef.current || !actionsRef.current) return;

//     //   const trackInfoRect = trackInfoRef.current.getBoundingClientRect();
//     //   const actionsRect = actionsRef.current.getBoundingClientRect();

//     //   const collisionDetected = trackInfoRect.right > actionsRect.left && trackInfoRect.left < actionsRect.right;
//     //   setIsCollision((prev) => (prev !== collisionDetected ? collisionDetected : prev));
//     // }, 1);
//     Promise.resolve().then(() => {
//       if (!trackInfoRef.current || !actionsRef.current) return;

//       const trackInfoRect = trackInfoRef.current.getBoundingClientRect();
//       const actionsRect = actionsRef.current.getBoundingClientRect();

//       const collisionDetected = trackInfoRect.right > actionsRect.left && trackInfoRect.left < actionsRect.right;

//       setIsCollision((prev) => (prev !== collisionDetected ? collisionDetected : prev));
//     });

//     // }, [curWidth, isPlaying, title]);
//     // }, [curWidth, title]);
//   }, [shrinkScreenSize, title, isPlaying, currentSongIndex, triggerEffect]);

//   // 昔の値を参照してるっていうかボタンを押した瞬間の値変更する前の値を参照してる
//   // setTimeoutで一時解決。だが、ほかの選択肢として、Promise.resolve().then(()これもある。
//   // でもこいつもこいつで一筋縄ではいかない

//   // useEffect(() => {
//   //   console.log(isCollision);
//   // }, [isCollision]);

//   useEffect(() => {
//     titleRef.current = title;

//     setTimeout(() => {
//       setTriggerEffect((prev) => !prev);
//     }, 0);
//   }, [title]);

//   function trimTrackTitle() {
//     // console.log('トリムトラック');

//     function processTrimming() {
//       let titleTextArray = Array.from(titleRef.current);
//       // let text = titleTextArray.slice(0, titleTextArray.length - removedCount);
//       let text = titleTextArray.slice(0, titleTextArray.length);
//       let isEllipsisAdded = text[text.length - 1] === '…';

//       // `isCollision` の最新の値を取得
//       setIsCollision((prev) => {
//         if (prev && trackInfoRef.current.clientWidth >= 331) {
//           if (!isEllipsisAdded) {
//             text.push('…');
//             isEllipsisAdded = true;
//           } else {
//             text.splice(-2, 1);
//             setRemovedCount((prev) => prev + 1);
//             // console.log(removedCount);
//           }
//           setTitle(text.join(''));
//           setTrimmedTitle(text.join(''));

//           setTimeout(processTrimming, 0);
//         }
//         return prev;
//       });
//     }

//     processTrimming();
//   }

//   useEffect(() => {
//     isCollisionRef.current = isCollision;
//     trimTrackTitle();
//   }, [isCollision, currentSongIndex, isPlaying]);

//   useEffect(() => {
//     untrimmedTitleRef.current = songs[currentSongIndex].title;
//     setRemovedCount(0);
//   }, [currentSongIndex]);

//   const restoreTrackTitle = () => {
//     // console.log('リストラ');

//     let isRestoring = false;

//     // function processRemoveTrimming() {
//     //   // console.log('発動');
//     //   // console.log(isCollisionRef.current);
//     //   // if (isCollisionRef.current) return;

//     //   // if (isRestoring || removedCount === 0) return;
//     //   isRestoring = true;
//     //   let titleTextArray = Array.from(untrimmedTitleRef.current);
//     //   let currentTrimmedTitle = Array.from(titleRef.current);
//     //   console.log(titleRef.current);

//     //   // while (titleTextArray.length !== currentTrimmedTitle.length) {
//     //   // if (isCollision) return;
//     //   if (titleTextArray.length === currentTrimmedTitle.length) return;

//     //   // console.log(titleTextArray.length);
//     //   // console.log(currentTrimmedTitle.length);
//     //   let result;
//     //   let index = currentTrimmedTitle.length - 1;
//     //   result = titleTextArray.slice(index, index + 1)[0];
//     //   currentTrimmedTitle.splice(index, index + 1, result);
//     //   setTitle(currentTrimmedTitle.join(''));
//     //   // }

//     //   // setIsCollision((prev) => {
//     //   //   console.log(prev);
//     //   //   if (!isCollision) {
//     //   //     console.log('リトリミング');
//     //   //     setTitle(currentTrimmedTitle.join(''));

//     //   //     setTimeout(processRemoveTrimming, 0);
//     //   //   }
//     //   //   return prev;
//     //   // });
//     // }
//     function processRemoveTrimming() {
//       // console.log('発動');
//       // console.log(isCollisionRef.current);
//       // if (isCollisionRef.current) return;

//       // if (isRestoring || removedCount === 0) return;
//       isRestoring = true;
//       let titleTextArray = Array.from(untrimmedTitleRef.current);
//       let currentTrimmedTitle = Array.from(titleRef.current);
//       console.log(titleRef.current);

//       // while (titleTextArray.length !== currentTrimmedTitle.length) {
//       // if (isCollision) return;
//       if (titleTextArray.length === currentTrimmedTitle.length) return;

//       // console.log(titleTextArray.length);
//       // console.log(currentTrimmedTitle.length);
//       let result;
//       let index = currentTrimmedTitle.length - 1;
//       result = titleTextArray.slice(index, index + 1)[0];
//       currentTrimmedTitle.splice(index, index + 1, result);
//       setTitle(titleTextArray.join(''));
//       // }

//       // setIsCollision((prev) => {
//       //   console.log(prev);
//       //   if (!isCollision) {
//       //     console.log('リトリミング');
//       //     setTitle(currentTrimmedTitle.join(''));

//       //     setTimeout(processRemoveTrimming, 0);
//       //   }
//       //   return prev;
//       // });
//     }
//     processRemoveTrimming();

//     // if (isRestoring || removedCount === 0) return;
//     // setIsRestoring(true);

//     // const trackTitle = trackMetaRef.current.firstElementChild;
//     // let text = originalTextArray.slice(0, originalTextArray.length - removedCount);

//     // while (removedCount > 0) {
//     //   // if (isColliding()) {
//     //   if (isCollision) {
//     //     break;
//     //   }
//     //   const restoredChar = originalTextArray[originalTextArray.length - removedCount];
//     //   text.splice(text.length - 1, 0, restoredChar);
//     //   setRemovedCount((prev) => prev - 1);

//     //   if (removedCount === 0) {
//     //     text = originalTextArray.slice();
//     //   }

//     //   // trackTitle.textContent = text.join('');
//     //   setTitle(text.join(''));
//     //   // calcTrackInfoWidth();
//     // }

//     // setIsRestoring(false);
//   };

//   useLayoutEffect(() => {
//     setTimeout(() => {
//       if (!trackInfoRef.current || !trackMetaRef.current) return;
//       const offsetValue = 35;
//       const coverArtWidth = imgRef.current.clientWidth;
//       const trackMetaWidth = trackMetaRef.current.clientWidth;
//       let newWidth;
//       if (isVisible) {
//         newWidth = trackMetaWidth + offsetValue;
//       } else {
//         newWidth = coverArtWidth + trackMetaWidth + offsetValue;
//       }
//       setWidth(newWidth);
//     }, 0);
//   }, [currentSongIndex, isPlaying, title, isVisible]);

//   function fadeTransition() {
//     const transitionElement = transitionRef.current;
//     transitionElement.style.visibility = 'visible';
//     transitionElement.style.opacity = 1;
//     function handleTransitionEnd() {
//       transitionElement.style.visibility = 'hidden';
//       transitionElement.style.opacity = 1;
//     }
//     setTimeout(() => {
//       transitionElement.style.opacity = 0;
//       transitionElement.addEventListener('transitionend', handleTransitionEnd);
//     }, 50);
//     // }, 100);
//   }

//   useEffect(() => {
//     if (isFirstRender.current) {
//       isFirstRender.current = false;
//       return;
//     }
//     if (prevSongIndex.current !== currentSongIndex) {
//       fadeTransition();
//     }
//     prevSongIndex.current = currentSongIndex;

//     setTitle(songs[currentSongIndex].title);
//     setArtist(songs[currentSongIndex].artist);
//     imgRef.current.src = songs[currentSongIndex].cover;

//     setIsHidden(true);
//   }, [currentSongIndex, isPlaying]);
//   // }, [currentSongIndex]);

//   ///////////////////////////////////////////////////////////////////////////////////////////////////

//   // function handleTrackInfoClick() {
//   //   setIsVisible((prev) => !prev);
//   // }

//   return (
//     <>
//       <div ref={trackInfoRef} className="player-controls__track-info" style={{ width: `${width}px` }} onClick={handleTrackInfoClick}>
//         {/* <div ref={trackInfoRef} className="player-controls__track-info"> */}
//         <figure className="player-controls__track">
//           <div id="js-track-thumbnail-wrapper" className="player-controls__track-thumbnail-wrapper">
//             <img
//               ref={imgRef}
//               id="js-track-thumbnail"
//               src={'img/写真アイコン4.png'}
//               alt="サムネイル"
//               className="player-controls__track-thumbnail"
//             />
//             <div
//               ref={transitionRef}
//               className="player-controls__track-thumbnail-transition"
//               style={{ visibility: isHidden ? 'hidden' : 'visible' }}
//             ></div>
//           </div>
//           <figcaption ref={trackMetaRef} className="player-controls__track-meta">
//             <p className="player-controls__title">{title}</p>
//             <p className="player-controls__artist">{artist}</p>
//           </figcaption>
//         </figure>
//       </div>
//     </>
//   );
// };

// export default TrackInfo;
///////////////////////////////////////
import React, { useState, useEffect, useLayoutEffect, useRef, useContext } from 'react';
import { music, songs, playSong } from './PlayMusic';
import { usePlayerContext } from './PlayerContext';
// import { debounce } from 'lodash';
import { throttle } from 'lodash';
import { TrackInfoContext } from './TrackInfoContext';
import Tooltip from './Tooltip';
import useButtonTooltip from '../hooks/useButtonTooltip';
import useDelayedText from '../hooks/useDelayText';

const TrackInfo = ({ actionsRef }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  // const [title, setTitle] = useState('曲のタイトル');
  // const [title, setTitle] = useState('123456789123456789123456789123456789123456789123456789123456789');
  const [title, setTitle] = useState('123456789123456789123456789123456789123456789123456789');
  const [artist, setArtist] = useState('アーティスト・作者');
  const imgRef = useRef(null);
  const [isHidden, setIsHidden] = useState(false);
  const { isPlaying, currentSongIndex, trackImage, trackTitle, trackArtistName } = usePlayerContext();
  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip(600);

  const tooltipText = useDelayedText('全画面表示：オフ', '全画面表示', isFullScreen, isFullScreen, 0);
  const isFirstRender = useRef(true);
  const transitionRef = useRef(null);
  const prevSongIndex = useRef(null);
  // トラックの抜粋機能↓↓
  const trackInfoRef = useRef(null);
  const trackMetaRef = useRef(null);

  // const [width, setWidth] = useState(231);
  const [width, setWidth] = useState(85);

  const [originalTextArray, setOriginalTextArray] = useState([]);
  const [removedCount, setRemovedCount] = useState(0);
  // const [isRestoring, setIsRestoring] = useState(false);

  const [isCollision, setIsCollision] = useState(false);

  // const [trackTitle, setTrackElement] = useState(null);
  const titleRef = useRef(title);

  const [curWidth, setCurWidth] = useState(null);

  const isCollisionRef = useRef(null);

  const [expandScreenSize, setExpandScreenSize] = useState(window.innerWidth);
  const [shrinkScreenSize, setShrinkScreenSize] = useState(window.innerWidth);

  const [triggerEffect, setTriggerEffect] = useState(false);

  const [trimmedTitle, setTrimmedTitle] = useState(title);

  // const [untrimmedTitle, setUntrimmedTitle] = useState(songs[currentSongIndex].title);
  const untrimmedTitleRef = useRef(songs[currentSongIndex].title);

  // const [isVisible, setIsVisible] = useState(false);
  const { handleTrackInfoClick, isVisible } = useContext(TrackInfoContext);

  // const [trackTitle, setTrackElement] = useState(trackMetaRef.current.firstElementChild);

  let previousWidth = window.innerWidth;

  const handleResize = throttle(() => {
    const currentWidth = window.innerWidth;
    if (currentWidth > previousWidth) {
      // 画面拡大
      // setCurWidth(currentWidth);
      setExpandScreenSize(currentWidth);
      // console.log(isCollisionRef.current);

      restoreTrackTitle();
    } else if (currentWidth < previousWidth) {
      setCurWidth(currentWidth);
      setShrinkScreenSize(currentWidth);
      console.log(isCollisionRef.current);
      // 画面縮小
    }
    previousWidth = currentWidth;
    // }, 100); // 200msの遅延でイベントをまとめて処理
  }, 200); // 200msの遅延でイベントをまとめて処理

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentSongIndex]);

  useLayoutEffect(() => {
    // setTimeout(() => {
    //   if (!trackInfoRef.current || !actionsRef.current) return;

    //   const trackInfoRect = trackInfoRef.current.getBoundingClientRect();
    //   const actionsRect = actionsRef.current.getBoundingClientRect();

    //   const collisionDetected = trackInfoRect.right > actionsRect.left && trackInfoRect.left < actionsRect.right;
    //   setIsCollision((prev) => (prev !== collisionDetected ? collisionDetected : prev));
    // }, 1);
    Promise.resolve().then(() => {
      if (!trackInfoRef.current || !actionsRef.current) return;

      const trackInfoRect = trackInfoRef.current.getBoundingClientRect();
      const actionsRect = actionsRef.current.getBoundingClientRect();

      const collisionDetected = trackInfoRect.right > actionsRect.left && trackInfoRect.left < actionsRect.right;

      setIsCollision((prev) => (prev !== collisionDetected ? collisionDetected : prev));
    });

    // }, [curWidth, isPlaying, title]);
    // }, [curWidth, title]);
  }, [shrinkScreenSize, title, isPlaying, currentSongIndex, triggerEffect]);

  // 昔の値を参照してるっていうかボタンを押した瞬間の値変更する前の値を参照してる
  // setTimeoutで一時解決。だが、ほかの選択肢として、Promise.resolve().then(()これもある。
  // でもこいつもこいつで一筋縄ではいかない

  // useEffect(() => {
  //   console.log(isCollision);
  // }, [isCollision]);

  useEffect(() => {
    titleRef.current = title;

    setTimeout(() => {
      setTriggerEffect((prev) => !prev);
    }, 0);
  }, [title]);
  // let currentTrimmedTitle;
  function trimTrackTitle() {
    // console.log('トリムトラック');

    function processTrimming() {
      let titleTextArray = Array.from(titleRef.current);
      // let text = titleTextArray.slice(0, titleTextArray.length - removedCount);
      let text = titleTextArray.slice(0, titleTextArray.length);
      // let isEllipsisAdded = text[text.length - 1] === '〃';
      let isEllipsisAdded = text[text.length - 1] === '…';

      // `isCollision` の最新の値を取得
      setIsCollision((prev) => {
        // if (prev && trackInfoRef.current.clientWidth >= 231) {
        // if (prev || trackInfoRef.current.clientWidth >= 231) {
        if (prev) {
          if (!isEllipsisAdded) {
            text.push('…');
            isEllipsisAdded = true;
          } else {
            // text.splice(-2, 1);
            text.splice(-2, 1);
            setRemovedCount((prev) => prev + 1);
            // console.log(removedCount);
          }
          setTitle(text.join(''));
          setTrimmedTitle(text.join(''));

          setTimeout(processTrimming, 0);
        }
        return prev;
      });
    }

    processTrimming();
  }

  useEffect(() => {
    isCollisionRef.current = isCollision;
    trimTrackTitle();
  }, [isCollision, currentSongIndex, isPlaying]);

  useEffect(() => {
    untrimmedTitleRef.current = songs[currentSongIndex].title;
    setRemovedCount(0);
  }, [currentSongIndex]);

  const restoreTrackTitle = () => {
    // console.log('リストラ');

    let isRestoring = false;

    // function processRemoveTrimming() {
    //   // console.log('発動');
    //   // console.log(isCollisionRef.current);
    //   // if (isCollisionRef.current) return;

    //   // if (isRestoring || removedCount === 0) return;
    //   isRestoring = true;
    //   let titleTextArray = Array.from(untrimmedTitleRef.current);
    //   let currentTrimmedTitle = Array.from(titleRef.current);
    //   console.log(titleRef.current);

    //   // while (titleTextArray.length !== currentTrimmedTitle.length) {
    //   // if (isCollision) return;
    //   if (titleTextArray.length === currentTrimmedTitle.length) return;

    //   // console.log(titleTextArray.length);
    //   // console.log(currentTrimmedTitle.length);
    //   let result;
    //   let index = currentTrimmedTitle.length - 1;
    //   result = titleTextArray.slice(index, index + 1)[0];
    //   currentTrimmedTitle.splice(index, index + 1, result);
    //   setTitle(currentTrimmedTitle.join(''));
    //   // }

    //   // setIsCollision((prev) => {
    //   //   console.log(prev);
    //   //   if (!isCollision) {
    //   //     console.log('リトリミング');
    //   //     setTitle(currentTrimmedTitle.join(''));

    //   //     setTimeout(processRemoveTrimming, 0);
    //   //   }
    //   //   return prev;
    //   // });
    // }
    function processRemoveTrimming() {
      // console.log('発動');
      // console.log(isCollisionRef.current);
      // if (isCollisionRef.current) return;

      // if (isRestoring || removedCount === 0) return;
      isRestoring = true;
      let titleTextArray = Array.from(untrimmedTitleRef.current);
      let currentTrimmedTitle = Array.from(titleRef.current);
      // currentTrimmedTitle = Array.from(titleRef.current);

      // while (titleTextArray.length !== currentTrimmedTitle.length) {
      // if (isCollision) return;
      if (titleTextArray.length === currentTrimmedTitle.length) return;
      // if (titleTextArray.length === currentTrimmedTitle.length || trackInfoRef.current.clientWidth <= 231) return;
      console.log(titleRef.current);
      console.log(currentTrimmedTitle);

      // console.log(titleTextArray.length);
      // console.log(currentTrimmedTitle.length);
      let result;
      let index = currentTrimmedTitle.length - 1;
      result = titleTextArray.slice(index, index + 1)[0];
      currentTrimmedTitle.splice(index, index + 1, result);
      setTitle(titleTextArray.join(''));
      // }

      // setIsCollision((prev) => {
      //   console.log(prev);
      //   if (!isCollision) {
      //     console.log('リトリミング');
      // setTitle(currentTrimmedTitle.join(''));

      //     setTimeout(processRemoveTrimming, 0);
      //   }
      //   return prev;
      // });
    }
    processRemoveTrimming();

    // if (isRestoring || removedCount === 0) return;
    // setIsRestoring(true);

    // const trackTitle = trackMetaRef.current.firstElementChild;
    // let text = originalTextArray.slice(0, originalTextArray.length - removedCount);

    // while (removedCount > 0) {
    //   // if (isColliding()) {
    //   if (isCollision) {
    //     break;
    //   }
    //   const restoredChar = originalTextArray[originalTextArray.length - removedCount];
    //   text.splice(text.length - 1, 0, restoredChar);
    //   setRemovedCount((prev) => prev - 1);

    //   if (removedCount === 0) {
    //     text = originalTextArray.slice();
    //   }

    //   // trackTitle.textContent = text.join('');
    //   setTitle(text.join(''));
    //   // calcTrackInfoWidth();
    // }

    // setIsRestoring(false);
  };

  useLayoutEffect(() => {
    setTimeout(() => {
      if (!trackInfoRef.current || !trackMetaRef.current) return;
      const offsetValue = 35;
      const coverArtWidth = imgRef.current.clientWidth;
      const trackMetaWidth = trackMetaRef.current.clientWidth;
      let newWidth;
      if (isVisible) {
        newWidth = trackMetaWidth + offsetValue;
      } else {
        newWidth = coverArtWidth + trackMetaWidth + offsetValue;
      }
      setWidth(newWidth);
    }, 0);
  }, [currentSongIndex, isPlaying, title, isVisible, trackTitle]);

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
    console.log('playerrrrrrrr');
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (prevSongIndex.current !== currentSongIndex) {
      fadeTransition();
    }
    // prevSongIndex.current = currentSongIndex;

    // setTitle(songs[currentSongIndex].title);
    // setArtist(songs[currentSongIndex].artist);
    // imgRef.current.src = songs[currentSongIndex].cover;

    setIsHidden(true);
    // }, [currentSongIndex, isPlaying]);
    // }, [currentSongIndex]);
  }, [trackTitle]);

  ///////////////////////////////////////////////////////////////////////////////////////////////////

  // function handleTrackInfoClick() {
  //   // setIsVisible((prev) => !prev);
  //   isButtonPressed();
  // }
  // useEffect(() => {

  // })

  return (
    <>
      <div
        ref={trackInfoRef}
        className="player-controls__track-info"
        style={{ width: `${width}px` }}
        // onClick={handleTrackInfoClick}
        onClick={() => {
          handleTrackInfoClick();
          handleButtonPress();
          setIsFullScreen((prev) => !prev);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* <div ref={trackInfoRef} className="player-controls__track-info"> */}
        <figure className="player-controls__track">
          <div id="js-track-thumbnail-wrapper" className="player-controls__track-thumbnail-wrapper">
            {/* <img ref={imgRef} src={trackImage} alt="サムネイル" className="player-controls__track-thumbnail" /> */}
            <img ref={imgRef} src={trackImage} alt="thumbnail" className="player-controls__track-thumbnail" />
            <div
              ref={transitionRef}
              className="player-controls__track-thumbnail-transition"
              style={{ visibility: isHidden ? 'hidden' : 'visible' }}
            ></div>
          </div>
          <figcaption ref={trackMetaRef} className="player-controls__track-meta">
            <p className="player-controls__title">{trackTitle}</p>
            <p className="player-controls__artist">{trackArtistName}</p>
          </figcaption>
        </figure>
        <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={'tooltip-track-info'}>
          {tooltipText}
        </Tooltip>
      </div>
    </>
  );
};

export default TrackInfo;
