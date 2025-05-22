import { useContext, useRef, useState, useEffect } from "react";
import { TrackInfoContext } from "../contexts/TrackInfoContext";
import { usePlayerContext } from "../contexts/PlayerContext";
// import { SearchContext } from "../contexts/SearchContext";
import { ActionSuccessMessageContext } from "../contexts/ActionSuccessMessageContext";

export const ThumbnailPreview = () => {
  const { trackImage, trackTitle, trackArtistName, isPlaying, togglePlayPause, isTrackSet } = usePlayerContext();
  const { isVisible, setIsVisible } = useContext(TrackInfoContext);
  // const { isTrackSet } = useContext(SearchContext);

  const [delayedVisibility, setDelayedVisibility] = useState("hidden");
  const [scale, setScale] = useState(1);

  const coverArtRef = useRef(null);
  const transitionRef = useRef(null);
  const { showMessage } = useContext(ActionSuccessMessageContext);

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
  }, [trackTitle]);

  // const FADE_DURATION = 2500;

  // useEffect(() => {
  //   if (!isTrackSet && isPlaying) {
  //     showMessage("unselected");
  //     // setIsVisible(true);
  //     setTimeout(() => {
  //       // setIsVisible(false);
  //       togglePlayPause();
  //     }, FADE_DURATION);
  //   }
  // }, [isPlaying, trackTitle]);

  useEffect(() => {
    console.log(trackTitle);
  }, [trackTitle]);

  return (
    <>
      <div
        className={`thumbnail-preview ${isVisible ? "is-visible" : ""}`}
        style={{
          opacity: isVisible ? 1 : 0,
          visibility: isTrackSet ? delayedVisibility : "visible",
        }}
      >
        <div className="thumbnail-preview__background" style={{ backgroundImage: `url(${isTrackSet ? trackImage : ""})` }}></div>
        <figure className="thumbnail-preview__content">
          <div className="thumbnail-preview__image-warpper" style={{ transform: `scale(${scale})` }}>
            <img ref={coverArtRef} className="thumbnail-preview__image" src={trackImage} alt="" />
            <div ref={transitionRef} className="thumbnail-preview__image-transition"></div>
          </div>
          <figcaption className="thumbnail-preview__info">
            <p className="thumbnail-preview__title">{isTrackSet ? trackTitle : "曲がセットされていません"}</p>
            <p className="thumbnail-preview__artist">{isTrackSet ? trackArtistName : ""}</p>
          </figcaption>
        </figure>
      </div>
    </>
  );
};
export default ThumbnailPreview;
