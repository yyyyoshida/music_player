import { useState, useEffect } from "react";

import { usePlayerContext } from "../../contexts/PlayerContext";

const CurrentTime = () => {
  const [songCurrentTime, setSongCurrentTime] = useState("0:00");
  const { currentTime, formatTime } = usePlayerContext();

  useEffect(() => {
    setSongCurrentTime(formatTime(currentTime));
  }, [currentTime]);

  return (
    <span id="js-current-time" className="player-controls__current-time">
      {songCurrentTime}
    </span>
  );
};

export default CurrentTime;
