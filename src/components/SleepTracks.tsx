import { useEffect } from "react";
import { pauseIcon, playIcon } from "../assets/icons";
import usePlaylistStore from "../store/playlistStore";
import usePlaybackStore from "../store/playbackStore";
import usePlayerStore from "../store/playerStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";

import type { SpotifyTrack, LocalTrack } from "../types/tracksType";
import useSleepTracks from "../hooks/useSleepTracks";

const SleepTracks = () => {
  const tracks = usePlaylistStore((state) => state.tracks);

  const { fetchSleepTracks } = useSleepTracks();

  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playDisable = usePlayerStore((state) => state.playDisable);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);
  const setIsTrackSet = usePlayerStore((state) => state.setIsTrackSet);
  const currentTrackId = usePlaybackStore((state) => state.currentTrackId);
  const setCurrentPlayedAt = usePlaybackStore((state) => state.setCurrentPlayedAt);
  const playTrackAtIndex = usePlaybackStore((state) => state.playTrackAtIndex);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

  useEffect(() => {
    fetchSleepTracks();
  }, []);

  function handleClickTrackItem(track: SpotifyTrack | LocalTrack, date: string, index: number, isCurrentTrack: boolean) {
    if (playDisable) {
      showMessage("tooFrequent");
      return;
    }

    let uri;

    if ("trackUri" in track) {
      uri = track.trackUri;
    } else if ("uri" in track) {
      uri = track.uri;
    } else if ("audioURL" in track) {
      uri = track.audioURL;
    }

    if (!uri) {
      return;
    }

    if (isCurrentTrack) {
      togglePlayPause();
      return;
    }

    setIsTrackSet(true);
    if (date) setCurrentPlayedAt(date);
    playTrackAtIndex(index);
  }

  return (
    <div className="sleep">
      <h1 className="sleep__title">スリープ曲一覧</h1>

      <p className="sleep__text">一時的に非表示にしている曲</p>

      <ul className="sleep__track-list">
        {(tracks as (SpotifyTrack | LocalTrack)[]).map((track, index) => {
          const addedAt = track.addedAt;
          const date: string | Date = new Date(addedAt ?? 0).toLocaleString();

          const isCurrentTrack = currentTrackId === track.id;
          const isActiveTrack = currentTrackId === track.id && isPlaying;

          return (
            <li
              className="sleep__track-item"
              key={track.id}
              onClick={() => {
                handleClickTrackItem(track, date, index, isCurrentTrack);
              }}
            >
              <div className="sleep__track-cover-art-wrapper">
                <img className="sleep__track-cover-art" src={track.albumImage} alt={track.title} />

                <button className="sleep__track-play-pause-button play-pause-button">
                  <img src={playIcon} alt="" className="sleep__track-play-pause-button-icon play-pause-button-icon play-button-icon" />
                </button>
                <button className="sleep__track-restore-button">
                  <img src="img/restore.png" className="sleep__track-restore-button-icon" />
                </button>
              </div>

              <div className="sleep__track-info">
                <div className="sleep__track-name">{track.title}</div>
                <div className="sleep__track-artist">{track.artist}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SleepTracks;
