import { useEffect, useState } from "react";
import type { PlaylistObject } from "../store/playlistStore";
import type { TrackObject } from "../store/playbackStore";

type UseWaitForImagesLoadReturn = {
  imagesLoaded: boolean;
  isImageListEmpty: boolean;
};

const useWaitForImagesLoad = (
  type: "trackList" | "playlistCover",
  tracks: TrackObject[] | PlaylistObject[],
  deps: TrackObject[] | PlaylistObject[] = [],
  delay = 200,
  imagesLoadCount = 10
): UseWaitForImagesLoadReturn => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isImageListEmpty, setIsImageListEmpty] = useState(false);

  useEffect(() => {
    const imageUrls = getImageUrls(type, tracks, imagesLoadCount);

    let timeoutId: ReturnType<typeof setTimeout>;

    if (imageUrls.length === 0) {
      timeoutId = setTimeout(() => {
        setIsImageListEmpty(true);
        setImagesLoaded(false);
      }, delay);

      return () => clearTimeout(timeoutId);
    }

    setImagesLoaded(false);

    waitForAllImagesToLoad(imageUrls as string[]).then(() => {
      timeoutId = setTimeout(() => setImagesLoaded(true), delay);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, deps);

  return { imagesLoaded, isImageListEmpty };
};

function waitForAllImagesToLoad(imageUrls: string[]): Promise<void[]> {
  return Promise.all(
    imageUrls.map((url) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
      });
    })
  );
}

function getImageUrls(
  type: "trackList" | "playlistCover",
  tracks: TrackObject[] | PlaylistObject[],
  imagesLoadCount: number
): string[] {
  if (!tracks || tracks.length === 0) return [];

  let urls = [];

  if (type === "trackList") {
    urls = (tracks as TrackObject[]).slice(0, imagesLoadCount).map((track) => {
      if ("album" in track) {
        return track.album?.images?.[0]?.url;
      } else {
        return track.albumImage;
      }
    });
  } else {
    urls = (tracks as PlaylistObject[]).flatMap((track) => {
      const images = track.albumImages?.slice(0, 4) || [];
      return images;
    });
  }

  return urls.map((url) => url ?? "").filter(isValidUrl);
}

function isValidUrl(url: string | undefined) {
  return typeof url === "string" && url.trim() !== "" && url.startsWith("http");
}

export default useWaitForImagesLoad;
