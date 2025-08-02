import { useState, useContext, useRef, useEffect } from "react";
import { FALLBACK_COVER_IMAGE } from "../../assets/icons";
import { isFallback } from "../../utils/isFallback";

const PlaylistCoverImageGrid = ({
  images,
  wrapperClassName = "",
  fallbackImgWrapperClassName = "",
  fallbackImgClassName = "",
  imgClassName = "",
}) => {
  const [delayedImages, setDelayedImages] = useState(images);
  const DELAYED_REFLECTION_TIME = 160;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDelayedImages(images);
    }, DELAYED_REFLECTION_TIME);

    return () => clearTimeout(timeoutId);
  }, [images]);

  const hasNoImage = delayedImages.length === 0;
  const isSingleImage = delayedImages.length <= 3;
  const displayImages = hasNoImage ? [FALLBACK_COVER_IMAGE] : [...delayedImages].slice(0, delayedImages.length <= 3 ? 1 : 4);
  const isFallbackImage = (imgSrc) => isFallback(imgSrc);

  return (
    <div className={`playlist-cover-image-grid ${isSingleImage ? "single" : ""} ${wrapperClassName}`}>
      {displayImages.map((imgSrc, index) =>
        isFallbackImage(imgSrc) ? (
          <div key={index} className={`playlist-cover-fallback-wrapper ${fallbackImgWrapperClassName} track-${index}`}>
            <img src={FALLBACK_COVER_IMAGE} className={` ${fallbackImgClassName} img-${index}`} alt={`img-${index}`} width="99" height="99" />
          </div>
        ) : (
          <img key={index} src={imgSrc} alt={`track-${index}`} className={`playlist-cover-img ${imgClassName} img-${index}`} width="99" height="99" />
        )
      )}
    </div>
  );
};

export default PlaylistCoverImageGrid;
