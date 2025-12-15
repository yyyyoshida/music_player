export const getFetchedContentFadeAnimation = (showSkeleton: boolean, isDataFromCache: boolean) => {
  if (showSkeleton) return "";

  if (isDataFromCache) return "fade-in-up";

  return "fade-in";
};
