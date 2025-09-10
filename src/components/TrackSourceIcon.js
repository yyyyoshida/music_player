import { FaCompactDisc, FaSpotify } from "react-icons/fa";
import useTooltipStore from "../store/tooltipStore";

const TrackSourceIcon = ({ source }) => {
  const setTooltipText = useTooltipStore((state) => state.setTooltipText);

  const handleMouseEnter = useTooltipStore((state) => state.handleMouseEnter);
  const handleMouseLeave = useTooltipStore((state) => state.handleMouseLeave);

  return (
    <div
      className="track-source-icon-wrapper"
      onMouseEnter={(e) => {
        setTooltipText(source === "spotify" ? "Spotify再生" : "ローカル再生");
        handleMouseEnter(e);
      }}
      onMouseLeave={() => {
        handleMouseLeave();
      }}
      style={{ position: "relative", display: "inline-block" }}
    >
      {source === "spotify" ? (
        <FaSpotify className="track-source-icon track-source-icon-spotify" />
      ) : (
        <FaCompactDisc className="track-source-icon track-source-icon-local" />
      )}
    </div>
  );
};

export default TrackSourceIcon;
