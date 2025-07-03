import { usePlayerContext } from "../contexts/PlayerContext";

function AudioPlayer() {
  const { audioRef } = usePlayerContext();

  return (
    <div style={{ visibility: "hidden" }}>
      <audio ref={audioRef} />
    </div>
  );
}

export default AudioPlayer;
