import { useEffect } from "react";
import usePlaylistStore from "../store/playlistStore";
import SleepTrackItem from "./tracks/SleepTrackItem";

import type { SpotifyTrack, LocalTrack } from "../types/tracksType";
import useSleepTracks from "../hooks/useSleepTracks";

const SleepTracks = () => {
  const tracks = usePlaylistStore((state) => state.tracks);
  const { fetchSleepTracks } = useSleepTracks();

  useEffect(() => {
    fetchSleepTracks();
  }, []);

  return (
    <div className="sleep">
      <h1 className="sleep__title">スリープ曲一覧</h1>
      <p className="sleep__text">一時的に非表示にしている曲</p>
      <ul className="sleep__track-list">
        {(tracks as (SpotifyTrack | LocalTrack)[]).map((track, index) => {
          const addedAt = track.addedAt;
          const date: string | Date = new Date(addedAt ?? 0).toLocaleString();

          return <SleepTrackItem key={track.id} track={track} index={index} date={date} />;
        })}
      </ul>
    </div>
  );
};

export default SleepTracks;
