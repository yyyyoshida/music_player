import { useEffect, useRef, useState } from 'react'; // `music` は new Audio() で作られている前提
import { music } from '../components/PlayMusic';

export const useAudioVisualizer = () => {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const dataArrayRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    }

    if (!sourceRef.current) {
      sourceRef.current = audioContextRef.current.createMediaElementSource(music);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    function updateImageSize() {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i];
      }
      const average = sum / dataArrayRef.current.length;

      setScale(1 + average / 800);
      requestAnimationFrame(updateImageSize);
    }
    music.onplay = () => {
      console.log('始まったよ');
      audioContextRef.current.resume().then(() => {
        updateImageSize();
      });
    };
  }, []);

  return scale;
};
