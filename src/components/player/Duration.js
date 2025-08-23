import { useState, useEffect } from "react";
import usePlayerStore from "../../store/playerStore";
import { usePlayerContext } from "../../contexts/PlayerContext";

const Duration = () => {
  const [SongDuration, setSongDuration] = useState("0:00");
  const duration = usePlayerStore((state) => state.duration);
  const { formatTime } = usePlayerContext();

  useEffect(() => {
    setSongDuration(formatTime(duration));
  }, [duration]);

  return (
    <span id="js-duration" className="player-controls__duration">
      {SongDuration}
    </span>
  );
};

export default Duration;
