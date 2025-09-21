import { useContext, useRef } from "react";
import { TrackInfoContext } from "../contexts/TrackInfoContext";

import { isFallback } from "../utils/isFallback";
import usePlaybackStore from "../store/playbackStore";
import usePlayerStore from "../store/playerStore";
import useFadeTransition from "../hooks/useFadeTransition";
import { FALLBACK_COVER_IMAGE } from "../assets/icons";

export const ExpandedTrackCoverView = () => {
  const { isVisible } = useContext(TrackInfoContext);
  const transitionRef = useRef(null);

  const currentTitle = usePlaybackStore((state) => state.currentTitle);
  const currentArtistName = usePlaybackStore((state) => state.currentArtistName);
  const currentCoverImage = usePlaybackStore((state) => state.currentCoverImage);
  const isTrackSet = usePlayerStore((state) => state.isTrackSet);
  const isUsedFallbackImage = isFallback(currentCoverImage);

  useFadeTransition(transitionRef, currentTitle);

  return (
    <>
      <div
        className={`expanded-cover-view ${isVisible ? "is-visible" : ""}`}
        style={{
          opacity: isVisible ? 1 : 0,
        }}
      >
        {isTrackSet && !isUsedFallbackImage && <img className="expanded-cover-view__background-image" src={currentCoverImage} />}

        <figure className="expanded-cover-view__content">
          <div className="expanded-cover-view__image-wrapper">
            <img
              className={`expanded-cover-view__image ${isUsedFallbackImage ? "expanded-cover-view__image-fallback" : ""}`}
              src={isTrackSet ? currentCoverImage : FALLBACK_COVER_IMAGE}
              alt={`${currentArtistName} の ${currentTitle} のカバー画像`}
            />
            <div ref={transitionRef} className="expanded-cover-view__image-transition"></div>
          </div>
          <figcaption className="expanded-cover-view__info">
            <p className="expanded-cover-view__title">{isTrackSet ? currentTitle : "曲がセットされていません"}</p>
            <p className="expanded-cover-view__artist">{isTrackSet ? currentArtistName : ""}</p>
          </figcaption>
        </figure>
      </div>
    </>
  );
};
export default ExpandedTrackCoverView;
