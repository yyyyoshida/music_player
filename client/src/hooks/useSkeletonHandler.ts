import { useEffect, useState } from "react";

type SkeletonHandlerProps = {
  isDataLoading: boolean;
  skipSkeleton?: boolean;
  loadingDelay?: number;
  resetKey?: string | object | null;
};

export function useSkeletonHandler({
  isDataLoading,
  skipSkeleton = false,
  loadingDelay = 300,
  resetKey,
}: SkeletonHandlerProps): boolean {
  const [showSkeleton, setShowSkeleton] = useState(isDataLoading && !skipSkeleton);

  useEffect(() => {
    if (skipSkeleton) {
      setShowSkeleton(false);
      return;
    }

    if (isDataLoading) {
      setShowSkeleton(true);
      return;
    }

    // スケルトンUIの一瞬表示によるチラつき対策で遅延をかけてる
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, loadingDelay);

    return () => clearTimeout(timer);
  }, [isDataLoading, loadingDelay, skipSkeleton]);

  // 検索結果専用
  useEffect(() => {
    if (resetKey !== undefined) {
      setShowSkeleton(true);
    }
  }, [resetKey]);

  return showSkeleton;
}
