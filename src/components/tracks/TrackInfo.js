import { useState, useEffect, useLayoutEffect, useRef, useContext } from "react";

import { usePlayerContext } from "../../contexts/PlayerContext";

import { throttle } from "lodash";
import { TrackInfoContext } from "../../contexts/TrackInfoContext";
import Tooltip from "../Tooltip";
import useButtonTooltip from "../../hooks/useButtonTooltip";
import useDelayedText from "../../hooks/useDelayText";
import { PlaybackContext } from "../../contexts/PlaybackContext";
import { FALLBACK_COVER_IMAGE } from "../../assets/icons";

const TrackInfo = ({ actionsRef }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [title, setTitle] = useState("123456789123456789123456789123456789123456789123456789");
  const [artist, setArtist] = useState("アーティスト・作者");
  const imgRef = useRef(null);
  const [isHidden, setIsHidden] = useState(false);
  const [width, setWidth] = useState(85);

  const { isPlaying } = usePlayerContext();
  const { isButtonPressed, isHovered, handleButtonPress, setIsHovered } = useButtonTooltip(600);
  const tooltipText = useDelayedText("全画面表示：オフ", "全画面表示", isFullScreen, isFullScreen, 0);

  const { handleTrackInfoClick, isVisible } = useContext(TrackInfoContext);
  const { currentTrackId, currentTitle, currentArtistName, currentCoverImage } = useContext(PlaybackContext);

  const isFirstRender = useRef(true);
  const transitionRef = useRef(null);
  const prevSongIndex = useRef(null);
  // トラックの抜粋機能↓↓
  const trackInfoRef = useRef(null);
  const trackMetaRef = useRef(null);

  const isUsedFallbackImage = currentCoverImage === FALLBACK_COVER_IMAGE;

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
      if (newWidth < 150) {
        setWidth(150);
      } else {
        setWidth(newWidth);
      }
    }, 0);
  }, [isPlaying, title, isVisible, currentTitle]);

  function fadeTransition() {
    const transitionElement = transitionRef.current;
    transitionElement.style.visibility = "visible";
    transitionElement.style.opacity = 1;
    function handleTransitionEnd() {
      transitionElement.style.visibility = "hidden";
      transitionElement.style.opacity = 1;
    }
    setTimeout(() => {
      transitionElement.style.opacity = 0;
      transitionElement.addEventListener("transitionend", handleTransitionEnd);
    }, 50);
    // }, 100);
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fadeTransition();

    setIsHidden(true);
  }, [currentTrackId]);

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
        <figure className="player-controls__track">
          <div id="js-track-thumbnail-wrapper" className="player-controls__track-thumbnail-wrapper">
            <img
              ref={imgRef}
              src={currentCoverImage}
              alt={`${currentArtistName} の ${currentTitle} のカバー画像`}
              className={`player-controls__track-thumbnail ${isUsedFallbackImage ? "track-info-fallback-cover" : ""}`}
            />

            <div ref={transitionRef} className="player-controls__track-thumbnail-transition" style={{ visibility: isHidden ? "hidden" : "visible" }}></div>
          </div>
          <figcaption ref={trackMetaRef} className="player-controls__track-meta">
            <p className="player-controls__title">{currentTitle}</p>

            <p className="player-controls__artist">{currentArtistName}</p>
          </figcaption>
        </figure>
        <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={"tooltip-track-info"}>
          {tooltipText}
        </Tooltip>
      </div>
    </>
  );
};

export default TrackInfo;
