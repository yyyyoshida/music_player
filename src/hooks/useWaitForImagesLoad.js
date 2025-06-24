import { useEffect, useState } from "react";

const useWaitForImagesLoad = (type, tracks, deps = [], delay = 200, imagesLoadCount = 10) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isImageListEmpty, setIsImageListEmpty] = useState(false);

  useEffect(() => {
    const imageUrls = getImageUrls(type, tracks, imagesLoadCount);

    let timeoutId;

    if (imageUrls.length === 0) {
      timeoutId = setTimeout(() => {
        setIsImageListEmpty(true);
        setImagesLoaded(false);
      }, delay);

      return () => clearTimeout(timeoutId);
    }

    setImagesLoaded(false);

    waitForAllImagesToLoad(imageUrls).then(() => {
      timeoutId = setTimeout(() => setImagesLoaded(true), delay);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, deps);

  return { imagesLoaded, isImageListEmpty };
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

  let urls = [];

  if (type === "trackList") {
    urls = tracks.slice(0, imagesLoadCount).map((track) => {
      const primary = track.album?.images?.[0]?.url;
      const fallback = track.albumImage;

      return primary || fallback;
    });
  } else {
    urls = tracks.flatMap((track) => {
      const images = track.albumImages?.slice(0, 4) || [];
      return images;
    });
  }

  return urls.filter(isValidUrl);
}

function isValidUrl(url) {
  return typeof url === "string" && url.trim() !== "" && url.startsWith("http");
}

export default useWaitForImagesLoad;
