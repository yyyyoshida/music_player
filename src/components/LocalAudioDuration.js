import { useRef, useEffect } from "react";

const LocalAudioDuration = ({ file, onDuration }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (file && audioRef.current) {
      const objectUrl = URL.createObjectURL(file);
      audioRef.current.src = objectUrl;

      const handleLoadedMetadata = () => {
        onDuration(audioRef.current.duration);
        URL.revokeObjectURL(objectUrl);
      };

      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [file, onDuration]);

  return <audio ref={audioRef} preload="metadata" hidden />;
};

export default LocalAudioDuration;
