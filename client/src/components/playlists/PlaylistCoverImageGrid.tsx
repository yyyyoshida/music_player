import { useEffect } from "react";
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
  const hasNoImage = images.length === 0;
  const isSingleImage = images.length <= 3;
  const displayImages = hasNoImage ? [FALLBACK_COVER_IMAGE] : [...images].slice(0, images.length <= 3 ? 1 : 4);
  const isFallbackImage = (imgSrc: string | undefined) => !imgSrc || isFallback(imgSrc);

  const isCoverImageFading = usePlaylistStore((state) => state.isCoverImageFading);
  const showCoverImages = usePlaylistStore.getState().showCoverImages;
  const COVER_IMAGE_SHOW_DELAY = 600;

  // 曲の追加・削除でカバー画像が一瞬切り替わるちらつきを防ぐためのフェードアウト後に画像を表示する ↓
  useEffect(() => {
    const timer = setTimeout(() => {
      showCoverImages();
    }, COVER_IMAGE_SHOW_DELAY);

    return () => clearTimeout(timer);
  }, [isCoverImageFading]);

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
