import useVisualizer from "../hooks/useVisualizer";

type VisualizerProps = {
  children: React.ReactNode;
};

export default function Visualizer({ children }: VisualizerProps) {
  const { leftCanvasRef, rightCanvasRef } = useVisualizer();

  return (
    <div className="visualizer">
      <canvas ref={leftCanvasRef} className="visualizer-canvas" />
      {children}
      <canvas ref={rightCanvasRef} className="visualizer-canvas" />
    </div>
  );
}
