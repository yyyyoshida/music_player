import { useState, useEffect } from "react";
import usePlayerStore from "../../store/playerStore";
import { formatTime } from "../../utils/formatTime";

const CurrentTime = () => {
  const [songCurrentTime, setSongCurrentTime] = useState("0:00");
  const currentTime = usePlayerStore((state) => state.currentTime);

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
