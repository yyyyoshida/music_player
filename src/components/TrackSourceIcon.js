import { useContext } from "react";
import { FaCompactDisc, FaSpotify } from "react-icons/fa";
import useTooltipStore from "../store/tooltipStore";
import { TooltipContext } from "../contexts/TooltipContext";

const TrackSourceIcon = ({ source }) => {
  const setTooltipText = useTooltipStore((state) => state.setTooltipText);
  const { handleMouseEnter, handleMouseLeave } = useContext(TooltipContext);

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
