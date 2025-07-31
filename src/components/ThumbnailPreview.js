import { useContext, useRef, useState, useEffect } from "react";
import { TrackInfoContext } from "../contexts/TrackInfoContext";
import { usePlayerContext } from "../contexts/PlayerContext";
import { PlaybackContext } from "../contexts/PlaybackContext";
// import { SearchContext } from "../contexts/SearchContext";
import { isFallback } from "../utils/isFallback";
import { ActionSuccessMessageContext } from "../contexts/ActionSuccessMessageContext";
import { FALLBACK_COVER_IMAGE } from "../assets/icons";

export const ThumbnailPreview = () => {
  const { isPlaying, togglePlayPause, isTrackSet } = usePlayerContext();
  const { isVisible, setIsVisible } = useContext(TrackInfoContext);
  // const { isTrackSet } = useContext(SearchContext);

  const [delayedVisibility, setDelayedVisibility] = useState("hidden");
  const [scale, setScale] = useState(1);

  const coverArtRef = useRef(null);
  const transitionRef = useRef(null);

  const { currentTitle, currentArtistName, currentCoverImage } = useContext(PlaybackContext);

  const isUsedFallbackImage = isFallback(currentCoverImage);

  function showThumbnail() {
    setDelayedVisibility("visible");
  }

  function hideThumbnailDelay() {
    const hideDelay = 300;
    const timer = setTimeout(() => {
      setDelayedVisibility("hidden");
    }, hideDelay);
    return () => clearTimeout(timer);
  }
  // TrackInfoの中のfadeTransition関数も同じだから今後使い回せるようにする。↓↓
  function fadeTransition() {
    // const transitionDelay = 500; // たまにtransitionのアニメーションが途切れる
    const transitionDelay = 50;
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
    fadeTransition();
  }, [currentTitle]);

  // const FADE_DURATION = 2500;

  return (
    <>
      <div
        className={`thumbnail-preview ${isVisible ? "is-visible" : ""}`}
        style={{
          opacity: isVisible ? 1 : 0,
          visibility: isTrackSet ? delayedVisibility : "visible",
        }}
      >
        {isTrackSet && !isUsedFallbackImage && <img className="thumbnail-preview__background-image" src={currentCoverImage} />}

        <figure className="thumbnail-preview__content">
          <div className="thumbnail-preview__image-warpper" style={{ transform: `scale(${scale})` }}>
            <img
              ref={coverArtRef}
              className={`thumbnail-preview__image ${isUsedFallbackImage ? "thumbnail-preview__image-fallback" : ""}`}
              src={isTrackSet ? currentCoverImage : FALLBACK_COVER_IMAGE}
              alt={`${currentArtistName} の ${currentTitle} のカバー画像`}
            />
            <div ref={transitionRef} className="thumbnail-preview__image-transition"></div>
          </div>
          <figcaption className="thumbnail-preview__info">
            <p className="thumbnail-preview__title">{isTrackSet ? currentTitle : "曲がセットされていません"}</p>
            <p className="thumbnail-preview__artist">{isTrackSet ? currentArtistName : ""}</p>
          </figcaption>
        </figure>
      </div>
    </>
  );
};
export default ThumbnailPreview;
