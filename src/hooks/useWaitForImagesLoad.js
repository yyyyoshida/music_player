import { useEffect, useState } from "react";

const useWaitForImagesLoad = (type, tracks, deps = [], delay = 0, imagesLoadCount = 10) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const imageUrls = getImageUrls(type, tracks, imagesLoadCount);
    if (imageUrls.length === 0) return;

    setImagesLoaded(false);

    let timeoutId;
    waitForAllImagesToLoad(imageUrls).then(() => {
      timeoutId = setTimeout(() => setImagesLoaded(true), delay);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, deps);

  return imagesLoaded;
};

function waitForAllImagesToLoad(imageUrls) {
  return Promise.all(
    imageUrls.map((url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
      });
    })
  );
}

function getImageUrls(type, tracks, imagesLoadCount) {
  if (!tracks || tracks.length === 0) return [];

  if (type === "trackList") {
    return tracks
      .slice(0, imagesLoadCount)
      .map((track) => track.album?.images[0]?.url || track.albumImage || track.track.album.images[1].url)
      .filter(Boolean);
  } else {
    return tracks.flatMap((track) => track.albumImages?.slice(0, 4) || []).filter(Boolean);
  }
}

export default useWaitForImagesLoad;
