import { useEffect, useState } from "react";

export function useSkeletonHandler({ isImageListEmpty, imagesLoaded, resetKey }) {
  const [showSkeleton, setShowSkeleton] = useState(true);

  // 空 or 読み込む画像がなかったら
  useEffect(() => {
    if (isImageListEmpty) {
      setShowSkeleton(false);
    }
  }, [isImageListEmpty]);

  // 画像の読み込みが終わったら
  useEffect(() => {
    if (imagesLoaded) {
      setShowSkeleton(false);
    }
  }, [imagesLoaded]);

  // 検索結果専用
  useEffect(() => {
    setShowSkeleton(true);
  }, [resetKey]);

  return showSkeleton;
}
