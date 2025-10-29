import useTrackItem from "../../hooks/useTrackItem";
import type { SleepSpotifyTrack } from "../../types/tracksType";
import { pauseIcon, playIcon } from "../../assets/icons";

type SleepTrackItemProps = {
  track: SleepSpotifyTrack;
  index: number;
  date: string;
  restoreSleepTrack: (trackId: string | undefined, playlistIds: string[]) => Promise<void>;
};

const SleepTrackItem = ({ track, index, date, restoreSleepTrack }: SleepTrackItemProps) => {
  const { isCurrentTrack, isActiveTrack, handleClickTrackItem } = useTrackItem(track, index, date);

  return (
    <li
      className={`sleep__track-item ${isCurrentTrack ? "is-current" : ""} ${isActiveTrack ? "is-playing" : ""}`}
      key={track.id}
      onClick={handleClickTrackItem}
    >
      <div className="sleep__track-cover-art-wrapper">
        <img className="sleep__track-cover-art" src={track.albumImage} alt={track.title} />

        <button className="sleep__track-play-pause-button play-pause-button">
          <img
            src={isActiveTrack ? pauseIcon : playIcon}
            alt={isActiveTrack ? "pause" : "play"}
            className={`sleep__track-play-pause-button-icon play-pause-button-icon ${isActiveTrack ? "pause-button-icon" : "play-button-icon"} `}
          />
        </button>
        <button
          className="sleep__track-restore-button"
          onClick={(e) => {
            e.stopPropagation();
            restoreSleepTrack(
              track.id,
              track.playlistIds.map((p) => p.id)
            );
          }}
        >
          <img src="img/restore.png" className="sleep__track-restore-button-icon" />
        </button>
        <div className="equalizer">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </div>

      <div className="sleep__track-info">
        <div className="sleep__track-name">{track.title}</div>
        <div className="sleep__track-artist">{track.artist}</div>
      </div>
    </li>
  );
};

export default SleepTrackItem;
