import { useRef, useEffect } from "react";

type LocalAudioDurationProps = {
  file: File;
  onDuration: (duration: number) => void;
};

const LocalAudioDuration = ({ file, onDuration }: LocalAudioDurationProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (file && audioRef.current) {
      const objectUrl = URL.createObjectURL(file);
      audioRef.current.src = objectUrl;

      const handleLoadedMetadata = () => {
        onDuration(audioRef.current?.duration ?? 0);
        URL.revokeObjectURL(objectUrl);
      };

      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        audioRef.current?.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [file, onDuration]);

  return <audio ref={audioRef} preload="metadata" hidden />;
};

export default LocalAudioDuration;
