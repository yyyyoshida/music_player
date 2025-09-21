import { useState, useEffect, useRef, useContext } from "react";
import { TrackInfoContext } from "../../contexts/TrackInfoContext";
import useDelayedText from "../../hooks/useDelayText";
import usePlaybackStore from "../../store/playbackStore";
import useTooltipStore from "../../store/tooltipStore";
import { isFallback } from "../../utils/isFallback";
import useFadeTransition from "../../hooks/useFadeTransition";

const TrackInfo = () => {
  const MIN_WIDTH = 150;
  const DEFAULT_WIDTH = 85;

  const [width, setWidth] = useState(DEFAULT_WIDTH);

  const currentTitle = usePlaybackStore((state) => state.currentTitle);
  const currentArtistName = usePlaybackStore((state) => state.currentArtistName);
  const currentCoverImage = usePlaybackStore((state) => state.currentCoverImage);
  const currentTrackId = usePlaybackStore((state) => state.currentTrackId);

  const setTooltipText = useTooltipStore((state) => state.setTooltipText);
  const handleButtonPress = useTooltipStore((state) => state.handleButtonPress);
  const handleMouseEnter = useTooltipStore((state) => state.handleMouseEnter);
  const handleMouseLeave = useTooltipStore((state) => state.handleMouseLeave);

  const { handleTrackInfoClick, isVisible } = useContext(TrackInfoContext);
  useDelayedText(isVisible, "全画面表示：オフ", "全画面表示");

  const imgRef = useRef(null);
  const transitionRef = useRef(null);
  const trackInfoRef = useRef(null);
  const trackMetaRef = useRef(null);

  const isUsedFallbackImage = isFallback(currentCoverImage);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!trackInfoRef.current || !trackMetaRef.current) return;
      const OFFSET_VALUE = 35;

      const coverArtWidth = imgRef.current.clientWidth;
      const trackMetaWidth = trackMetaRef.current.clientWidth;
      let newWidth;
      if (isVisible) {
        newWidth = trackMetaWidth + OFFSET_VALUE;
      } else {
        newWidth = coverArtWidth + trackMetaWidth + OFFSET_VALUE;
      }
      if (newWidth < MIN_WIDTH) {
        setWidth(MIN_WIDTH);
      } else {
        setWidth(newWidth);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isVisible, currentTitle]);

  useFadeTransition(transitionRef, currentTrackId);

  return (
    <>
      <div
        ref={trackInfoRef}
        className="player-controls__track-info"
        style={{ width: `${width}px` }}
        onClick={() => {
          handleTrackInfoClick();
          handleButtonPress();
        }}
        onMouseEnter={(e) => {
          setTooltipText(isVisible ? "全画面表示：オフ" : "全画面表示");
          handleMouseEnter(e);
        }}
        onMouseLeave={() => {
          handleMouseLeave();
        }}
      >
        <figure className="player-controls__track">
          <div id="js-track-thumbnail-wrapper" className="player-controls__track-thumbnail-wrapper">
            <img
              ref={imgRef}
              src={currentCoverImage}
              alt={`${currentArtistName} の ${currentTitle} のカバー画像`}
              className={`player-controls__track-thumbnail ${isUsedFallbackImage ? "track-info-fallback-cover" : ""}`}
            />

            <div ref={transitionRef} className="player-controls__track-thumbnail-transition"></div>
          </div>
          <figcaption ref={trackMetaRef} className="player-controls__track-meta">
            <p className="player-controls__title">{currentTitle}</p>

            <p className="player-controls__artist">{currentArtistName}</p>
          </figcaption>
        </figure>
      </div>
    </>
  );
};

export default TrackInfo;
