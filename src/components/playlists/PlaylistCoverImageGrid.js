// import React from 'react'
import { FALLBACK_COVER_IMAGE } from "../../assets/icons";

const PlaylistCoverImageGrid = ({ images, wrapperClassName = "", fallbackImgWrapperClassName = "", fallbackImgClassName = "", imgClassName = "" }) => {
  const displayImages = [...images].slice(0, images.length <= 3 ? 1 : 4);
  // console.log(images);
  const isSingleImage = images.length <= 3;

  function isFallbackImage(imgSrc) {
    return imgSrc === FALLBACK_COVER_IMAGE;
  }

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
