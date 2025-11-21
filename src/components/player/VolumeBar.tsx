import { useRef } from "react";
import VolumeIcon from "./VolumeIcon";
import useTooltipStore from "../../store/tooltipStore";
import useDelayedText from "../../hooks/useDelayText";
import useVolumeBar from "../../hooks/useVolumeBar";

type VolumeBarProps = {
  initialValue: number;
};

const VolumeBar = ({ initialValue }: VolumeBarProps) => {
  const barRef = useRef<HTMLDivElement | null>(null);

  const setTooltipText = useTooltipStore((state) => state.setTooltipText);
  const handleButtonPress = useTooltipStore((state) => state.handleButtonPress);
  const handleMouseEnter = useTooltipStore((state) => state.handleMouseEnter);
  const handleMouseLeave = useTooltipStore((state) => state.handleMouseLeave);

  const { percentage, handleMouseDown, toggleMute, isMuted } = useVolumeBar({ initialValue, barRef });
  useDelayedText(isMuted, "ミュート：解除", "ミュート");

  return (
    <>
      <button
        className="player-controls__button player-controls__button--volume"
        onClick={() => {
          toggleMute();
          handleButtonPress();
        }}
        onMouseEnter={() => {
          setTooltipText(isMuted ? "ミュート：解除" : "ミュート");
          handleMouseEnter();
        }}
        onMouseLeave={() => {
          handleMouseLeave();
        }}
      >
        <VolumeIcon volume={percentage} isMuted={isMuted} />
      </button>
      <div ref={barRef} className="player-controls__volume-bar--wrapper" onMouseDown={handleMouseDown}>
        <div className="player-controls__volume-bar">
          <div className="player-controls__volume-fill" style={{ width: `${percentage}%` }}>
            <div className="player-controls__volume-thumb" style={{ left: `${percentage}%` }}></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VolumeBar;
