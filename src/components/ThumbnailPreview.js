import { useContext, useRef, useState, useEffect } from "react";
import { TrackInfoContext } from "../contexts/TrackInfoContext";

import { isFallback } from "../utils/isFallback";
import usePlaybackStore from "../store/playbackStore";
import usePlayerStore from "../store/playerStore";
import useFadeTransition from "../hooks/useFadeTransition";
import { FALLBACK_COVER_IMAGE } from "../assets/icons";

export const ThumbnailPreview = () => {
  const { isVisible, setIsVisible } = useContext(TrackInfoContext);

  const [delayedVisibility, setDelayedVisibility] = useState("hidden");
  const [scale, setScale] = useState(1);

  const coverArtRef = useRef(null);
  const transitionRef = useRef(null);

  const currentTitle = usePlaybackStore((state) => state.currentTitle);
  const currentArtistName = usePlaybackStore((state) => state.currentArtistName);
  const currentCoverImage = usePlaybackStore((state) => state.currentCoverImage);
  const isTrackSet = usePlayerStore((state) => state.isTrackSet);

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

  useEffect(() => {
    if (isVisible) {
      showThumbnail();
    } else {
      hideThumbnailDelay();
    }
  }, [isVisible]);

  useFadeTransition(transitionRef, currentTitle);

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
