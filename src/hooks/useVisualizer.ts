import { useEffect, useRef } from "react";
import { useVisualizerStore } from "../store/visualizerStore";

const useVisualizer = () => {
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const setCanvasRefs = useVisualizerStore((state) => state.setCanvasRefs);

  useEffect(() => {
    if (!leftCanvasRef.current || !rightCanvasRef.current) return;
    setCanvasRefs(leftCanvasRef, rightCanvasRef);
  }, [leftCanvasRef, rightCanvasRef]);

  useEffect(() => {
    const resize = () => {
      [leftCanvasRef.current, rightCanvasRef.current].forEach((canvas) => {
        if (!canvas) return;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      });
    };

    const observer = new ResizeObserver(resize);
    if (leftCanvasRef.current) observer.observe(leftCanvasRef.current);
    if (rightCanvasRef.current) observer.observe(rightCanvasRef.current);

    resize();

    return () => observer.disconnect();
  }, []);

  return { leftCanvasRef, rightCanvasRef };
};

export default useVisualizer;
