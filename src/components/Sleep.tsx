import { useEffect } from "react";
import usePlaylistStore from "../store/playlistStore";
import SleepTrackItem from "./tracks/SleepTrackItem";
import useWaitForImagesLoad from "../hooks/useWaitForImagesLoad";
import { useSkeletonHandler } from "../hooks/useSkeletonHandler";
import CardListSkeleton from "./skeletonUI/CardListSkeleton";

import type { SleepSpotifyTrack } from "../types/tracksType";
import useSleepTracks from "../hooks/useSleepTracks";

const SleepTracks = () => {
  const tracks = usePlaylistStore((state) => state.tracks);
  const { fetchSleepTracks, restoreSleepTrack } = useSleepTracks();
  const LOADING_IMAGE_DELAY = 200;
  const { imagesLoaded, isImageListEmpty } = useWaitForImagesLoad("trackList", tracks, [tracks], LOADING_IMAGE_DELAY);
  const showSkeleton = useSkeletonHandler({ isImageListEmpty, imagesLoaded });

  useEffect(() => {
    fetchSleepTracks();
  }, []);

  return (
    <div className="sleep">
      <h1 className="sleep__title">スリープ曲一覧</h1>
      <p className="sleep__text">一時的に非表示にしている曲</p>

      <div className="empty-message-wrapper">
        <p className={` fade-on-loaded ${showSkeleton || !isImageListEmpty ? "" : "fade-in-up"}`}>スリープ中の曲はありません</p>
      </div>

      {showSkeleton && <CardListSkeleton />}

      <ul className={`sleep__track-list fade-on-loaded ${showSkeleton ? "" : "fade-in-up"}`}>
        {(tracks as SleepSpotifyTrack[]).map((track, index) => {
          const addedAt = track.addedAt;
          const date: string | Date = new Date(addedAt ?? 0).toLocaleString();

          return <SleepTrackItem key={track.id} track={track} index={index} date={date} restoreSleepTrack={restoreSleepTrack} />;
        })}
      </ul>
    </div>
  );
};

export default SleepTracks;
