import { create } from "zustand";

export const useVisualizerStore = create<{
  leftCanvas: React.RefObject<HTMLCanvasElement | null> | null;
  rightCanvas: React.RefObject<HTMLCanvasElement | null> | null;
  setCanvasRefs: (
    left: React.RefObject<HTMLCanvasElement | null>,
    right: React.RefObject<HTMLCanvasElement | null>
  ) => void;

  startVisualizer: (() => void) | null;
  stopVisualizer: (() => void) | null;
  _animationId: number | null;
  isVisualizerActive: boolean;
}>((set, get) => ({
  leftCanvas: null,
  rightCanvas: null,
  _animationId: null,
  isVisualizerActive: false,

  setCanvasRefs: (left, right) => set({ leftCanvas: left, rightCanvas: right }),

  startVisualizer: async () => {
    const { leftCanvas, rightCanvas } = get();

    try {
      if (!leftCanvas || !rightCanvas) throw new Error("canvasの初期化が完了していません");

      const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
      const { analyser, data } = await setupAudioAnalyzer(stream);

      [leftCanvas.current, rightCanvas.current].forEach((canvas) => {
        if (canvas) resizeCanvas(canvas);
      });

      startDrawLoop(analyser, data, leftCanvas, rightCanvas);
      set({ isVisualizerActive: true });
    } catch (err) {
      console.error("Error accessing display media.", err);
    }
  },

  stopVisualizer: () => {
    const { _animationId, leftCanvas, rightCanvas } = get();

    if (_animationId !== null) {
      cancelAnimationFrame(_animationId);
      set({ _animationId: null });
    }

    [leftCanvas?.current, rightCanvas?.current].forEach((canvas) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    set({ isVisualizerActive: false });
  },
}));

function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

async function setupAudioAnalyzer(stream: MediaStream) {
  const ctx = new AudioContext();
  await ctx.resume();
  const src = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();

  src.connect(analyser);
  analyser.fftSize = 1024;

  const data = new Uint8Array(analyser.frequencyBinCount);
  return { analyser, data };
}

function draw(
  analyser: AnalyserNode,
  soundData: Uint8Array<ArrayBuffer>,
  leftCanvas: React.RefObject<HTMLCanvasElement | null>,
  rightCanvas: React.RefObject<HTMLCanvasElement | null>
) {
  analyser.getByteFrequencyData(soundData);

  const canvasConfigs = [
    { canvas: leftCanvas?.current, rotate180: false },
    { canvas: rightCanvas?.current, rotate180: true },
  ];

  canvasConfigs.forEach(({ canvas, rotate180 }) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resetCanvasContext(ctx, canvas, rotate180);
    drawBars(ctx, canvas, soundData);
    ctx.restore();
  });
}

function resetCanvasContext(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, rotate180: boolean) {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!rotate180) return;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
}

// // drawBarsの定数
const BAR_WIDTH = 4;
const BAR_GAP = 6;
const MIN_BAR_HEIGHT = 3;

const HEIGHT_AT_CENTER = 2;

const SOUND_VALUE_MAX = 255;
const SMOOTHING_DIVISOR = 3;

const HALF_INDEX_SHIFT = 1;
const PREV_INDEX = 1;

function drawBars(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  soundData: Uint8Array<ArrayBuffer>
) {
  const bars = Math.floor(canvas.width / (BAR_WIDTH + BAR_GAP));
  const centerY = canvas.height / 2;

  for (let i = 0; i < bars; i++) {
    const ratio = i / bars;
    const index = Math.floor(ratio * soundData.length);
    const rawValue =
      (soundData[index]! +
        (soundData[index >> HALF_INDEX_SHIFT] ?? 0) +
        (soundData[index - PREV_INDEX] ?? 0)) /
      SMOOTHING_DIVISOR;

    let height = (rawValue / SOUND_VALUE_MAX) * (canvas.height / HEIGHT_AT_CENTER);

    height = Math.max(height, MIN_BAR_HEIGHT);

    const x = i * (BAR_WIDTH + BAR_GAP);

    ctx.fillStyle = "#D91656";

    // 中央から上下のバーを描画 ↓
    ctx.fillRect(x, centerY - height, BAR_WIDTH, height);
    ctx.fillRect(x, centerY, BAR_WIDTH, height);
  }
}

function startDrawLoop(
  analyser: AnalyserNode,
  soundData: Uint8Array<ArrayBuffer>,
  leftCanvas: React.RefObject<HTMLCanvasElement | null>,
  rightCanvas: React.RefObject<HTMLCanvasElement | null>
) {
  const loop = () => {
    draw(analyser, soundData, leftCanvas, rightCanvas);
    const id = requestAnimationFrame(loop);
    useVisualizerStore.setState({ _animationId: id });
  };
  const id = requestAnimationFrame(loop);
  useVisualizerStore.setState({ _animationId: id });
}
