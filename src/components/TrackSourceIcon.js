import { FaCompactDisc, FaSpotify } from "react-icons/fa";

const TrackSourceIcon = ({ source }) => {
  //   console.log(source);
  return source === "local" ? (
    <FaCompactDisc title="ローカル再生" className="track-source-icon track-source-icon-local" />
  ) : (
    <FaSpotify title="Spotify再生" className="track-source-icon track-source-icon-spotify" />
  );
};

export default TrackSourceIcon;
