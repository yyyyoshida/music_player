import { useState, useEffect } from "react";
import { FALLBACK_COVER_IMAGE } from "../../assets/icons";
import { isFallback } from "../../utils/isFallback";
import usePlaylistStore from "../../store/playlistStore";

type PlaylistCoverImageGridProps = {
  images: (string | undefined)[];
  wrapperClassName?: string;
  fallbackImgWrapperClassName?: string;
  fallbackImgClassName?: string;
  imgClassName?: string;
};

const PlaylistCoverImageGrid = ({
  images,
  wrapperClassName = "",
  fallbackImgWrapperClassName = "",
  fallbackImgClassName = "",
  imgClassName = "",
}: PlaylistCoverImageGridProps) => {
  const isCoverImageFading = usePlaylistStore((state) => state.isCoverImageFading);
  const showCoverImages = usePlaylistStore((state) => state.showCoverImages);
  const [delayedImages, setDelayedImages] = useState(images);
  const COVER_IMAGE_UPDATE_DELAY = 160;
  const COVER_IMAGE_SHOW_DELAY = 600;

  // 現在開いてるプレイリストに同期させるため ↓
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDelayedImages(images);
    }, COVER_IMAGE_UPDATE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [images]);

  // 曲の追加・削除でカバー画像が一瞬切り替わるちらつきを防ぐため ↓
  useEffect(() => {
    const timer = setTimeout(() => {
      showCoverImages();
    }, COVER_IMAGE_SHOW_DELAY);

    return () => clearTimeout(timer);
  }, [isCoverImageFading]);

  const hasNoImage = delayedImages.length === 0;
  const isSingleImage = delayedImages.length <= 3;
  const displayImages = hasNoImage ? [FALLBACK_COVER_IMAGE] : [...delayedImages].slice(0, delayedImages.length <= 3 ? 1 : 4);
  const isFallbackImage = (imgSrc: string | undefined) => !imgSrc || isFallback(imgSrc);

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
