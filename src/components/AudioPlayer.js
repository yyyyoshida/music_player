import { useEffect, useRef } from "react"; // ←ここ必須
import usePlayerStore from "../store/playerStore";

function AudioPlayer() {
  const setAudioRef = usePlayerStore((state) => state.setAudioRef);

  const audioRef = useRef(null);

  useEffect(() => {
    setAudioRef(audioRef);
  }, []);

  return (
    <div style={{ visibility: "hidden" }}>
      <audio ref={audioRef} />
    </div>
  );
}

export default AudioPlayer;
