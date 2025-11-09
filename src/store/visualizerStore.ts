import { create } from "zustand";

export const useVisualizerStore = create<{
  leftCanvas: React.RefObject<HTMLCanvasElement | null> | null;
  rightCanvas: React.RefObject<HTMLCanvasElement | null> | null;
  setCanvasRefs: (
    left: React.RefObject<HTMLCanvasElement | null>,
    right: React.RefObject<HTMLCanvasElement | null>
  ) => void;

  startVisualizer: (() => void) | null;
}>((set, get) => ({
  leftCanvas: null,
  rightCanvas: null,

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
    } catch (err) {
      console.error("Error accessing display media.", err);
    }
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
const HEIGHT_AT_EDGES = 8;

const SOUND_VALUE_MAX = 255;
const SMOOTHING_DIVISOR = 3;

const CENTER_WEIGHT = 1;
const HALF_INDEX_SHIFT = 1;
const PREV_INDEX = 1;

function drawBars(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  soundData: Uint8Array<ArrayBuffer>
) {
  const bars = Math.floor(canvas.width / (BAR_WIDTH + BAR_GAP));

  const maxHeightCenterBased = canvas.height / HEIGHT_AT_CENTER;
  const maxHeightEdgeBased = canvas.height / HEIGHT_AT_EDGES;
  const centerY = canvas.height / 2;

  for (let barIndex = 0; barIndex < bars; barIndex++) {
    const barPositionRatio = barIndex / bars;

    // 例えば画面左側のバーから見て左側と右側を高さを混ぜた高さの上限 ↓
    const maxHeightBlend =
      maxHeightCenterBased * (CENTER_WEIGHT - barPositionRatio) + maxHeightEdgeBased * barPositionRatio;

    const soundIndex = Math.floor(barPositionRatio * soundData.length);

    // 前後の音データも参照して平均（滑らかに見せるため） ↓
    const rawValue =
      (soundData[soundIndex]! +
        soundData[soundIndex >> HALF_INDEX_SHIFT]! +
        (soundData[soundIndex - PREV_INDEX] ?? 0)) /
      SMOOTHING_DIVISOR;

    const barHeight = Math.max(
      Math.min((rawValue / SOUND_VALUE_MAX) * maxHeightCenterBased, maxHeightBlend),
      MIN_BAR_HEIGHT
    );
    const x = barIndex * (BAR_WIDTH + BAR_GAP);

    ctx.fillStyle = "#D91656";
    ctx.fillRect(x, centerY - barHeight, BAR_WIDTH, barHeight); // 上側のバーを描画
    ctx.fillRect(x, centerY, BAR_WIDTH, barHeight); // 下側のバーを描画
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
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
