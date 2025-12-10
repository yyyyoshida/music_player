import { useRef } from "react";

import useProgressBar from "../../hooks/useProgressBar";

type ProgressBarProps = {
  initialValue: number;
};

const ProgressBar = ({ initialValue }: ProgressBarProps) => {
  const barRef = useRef<HTMLDivElement | null>(null);

  const { percentage, handleMouseDown, playDisable } = useProgressBar({ initialValue: initialValue, barRef: barRef });

  return (
    <>
      <div ref={barRef} className="player-controls__progress-bar--wrapper" onMouseDown={handleMouseDown}>
        {playDisable ? (
          <div className="progress-bar-loading"></div>
        ) : (
          <div className="player-controls__progress-bar">
            <div className="player-controls__progress-fill" style={{ width: `${percentage}%` }}>
              <div className="player-controls__progress-thumb" style={{ left: `${percentage}%` }}></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProgressBar;
