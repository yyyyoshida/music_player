import { usePlayerContext } from "../contexts/PlayerContext";

function AudioPlayer() {
  const { audioRef, currentAudioURL } = usePlayerContext();
  //   console.log(audioRef);

  return (
    <div style={{ visibility: "hidden" }}>
      <audio ref={audioRef} src={currentAudioURL} />
    </div>
  );
}

export default AudioPlayer;
