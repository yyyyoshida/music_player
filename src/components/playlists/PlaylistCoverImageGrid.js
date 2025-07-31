import { FALLBACK_COVER_IMAGE } from "../../assets/icons";

const PlaylistCoverImageGrid = ({
  images,
  wrapperClassName = "",
  fallbackImgWrapperClassName = "",
  fallbackImgClassName = "",
  imgClassName = "",
}) => {
  const hasNoImage = images.length === 0;
  const isSingleImage = images.length <= 3;
  const displayImages = hasNoImage ? [FALLBACK_COVER_IMAGE] : [...images].slice(0, images.length <= 3 ? 1 : 4);
  const isFallbackImage = (imgSrc) => imgSrc.endsWith(FALLBACK_COVER_IMAGE);

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
