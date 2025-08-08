import { render, screen, fireEvent } from "@testing-library/react";
import ProgressBar from "../ProgressBar";
import RepeatContext from "../../../contexts/RepeatContext";
import { PlaybackContext } from "../../../contexts/PlaybackContext";
import PlayerContext from "../../../contexts/PlayerContext";
import useBarHandler from "../../../hooks/useBarHandler";

jest.mock("../../../hooks/useBarHandler", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockSeekToSpotify = jest.fn();
const mockSetIsPlaying = jest.fn();

const mockGoToNextTrack = jest.fn();
const mockCurrentIndex = jest.fn();

const mockSetPercentage = jest.fn();
const mockRoundToTwoDecimals = jest.fn();
const mockHandleMouseDown = jest.fn();
const mockAudioRef = {
  current: {
    currentTime: 0,
    duration: 100,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
};

beforeEach(() => {
  mockAudioRef.current = {
    currentTime: 0,
    play: jest.fn(),
    listeners: {},
    addEventListener: function (event, cb) {
      this.listeners[event] = cb;
    },
    removeEventListener: function (event) {
      delete this.listeners[event];
    },
  };

  useBarHandler.mockReturnValue({
    percentage: 0,
    setPercentage: mockSetPercentage,
    isDragging: false,
    roundToTwoDecimals: mockRoundToTwoDecimals,
    handleMouseDown: mockHandleMouseDown,
  });
});

function allProviders({
  currentTime = 0,
  isTrackSet = false,
  isRepeat = false,
  duration = 0,
  position = 0,
  isPlaying = false,
  isLocalPlaying = false,
  visibleLoading = false,
} = {}) {
  return (
    <RepeatContext.Provider value={{ isRepeat }}>
      <PlayerContext.Provider
        value={{
          currentTime,
          isTrackSet,
          isLocalReady: false,
          seekToSpotify: mockSeekToSpotify,
          duration,
          position,
          isPlaying,
          setIsPlaying: mockSetIsPlaying,
          isLocalPlaying,
          visibleLoading,
          audioRef: mockAudioRef,
        }}
      >
        <PlaybackContext.Provider
          value={{
            goToNextTrack: mockGoToNextTrack,
            currentIndex: mockCurrentIndex,
          }}
        >
          <ProgressBar />
        </PlaybackContext.Provider>
      </PlayerContext.Provider>
    </RepeatContext.Provider>
  );
}

//=================
// UIレンダリング系
//=================
test("初期レンダリング時のUIが正しく初期化されている", async () => {
  render(allProviders());

  const progressFill = document.querySelector(".player-controls__progress-fill");
  expect(progressFill).toBeInTheDocument();
  expect(progressFill).toHaveStyle({ width: "0%" });

  const progressThumb = document.querySelector(".player-controls__progress-thumb");
  expect(progressThumb).toBeInTheDocument();
  expect(progressThumb).toHaveStyle({ left: "0%" });
});

test("isLocalPlaying && visibleLoading のときにローディング表示される", () => {
  render(allProviders({ isLocalPlaying: true, visibleLoading: true }));
  const loadingProgressBar = document.querySelector(".progress-bar-loading");

  expect(loadingProgressBar).toBeInTheDocument();
});

//=============
// マウス操作系
//=============
test("再生バーをクリックするとhoandleMouseDownが発火", async () => {
  useBarHandler.mockReturnValue({
    percentage: 75,
    setPercentage: mockSetPercentage,
    isDragging: false,
    roundToTwoDecimals: mockRoundToTwoDecimals,
    handleMouseDown: mockHandleMouseDown,
  });

  render(allProviders());

  const progressBarWrapper = document.querySelector(".player-controls__progress-bar--wrapper");
  fireEvent.mouseDown(progressBarWrapper);
});

test("再生バーをドラッグすると位置が更新される", async () => {
  useBarHandler.mockReturnValue({
    percentage: 75,
    setPercentage: mockSetPercentage,
    isDragging: true,
    roundToTwoDecimals: mockRoundToTwoDecimals,
    handleMouseDown: mockHandleMouseDown,
  });

  render(allProviders());

  const progressThumb = document.querySelector(".player-controls__progress-thumb");
  const progressFill = document.querySelector(".player-controls__progress-fill");

  expect(progressThumb).toHaveStyle({ left: "75%" });
  expect(progressFill).toHaveStyle({ width: "75%" });
});

//=================
// 再生時のバー更新
//=================
test("positionが変化したときsetPercentageが呼ばれるか", async () => {
  const mockRound = jest.fn().mockReturnValue(42);

  useBarHandler.mockReturnValue({
    percentage: 0,
    setPercentage: mockSetPercentage,
    isDragging: false,
    roundToTwoDecimals: mockRound,
    handleMouseDown: mockHandleMouseDown,
  });

  const { rerender } = render(allProviders());

  rerender(allProviders({ duration: 100, position: 10 }));

  expect(mockRound).toHaveBeenCalledWith(10);
  expect(mockSetPercentage).toHaveBeenCalledWith(42);
});

//=================
// 再生終了時の挙動
//=================

test("Spotify曲の場合、0.2秒以下とリピートオンでseekToSpotify(0)が呼ばれるか", async () => {
  jest.useFakeTimers();
  const { rerender } = render(allProviders({ isRepeat: true, duration: 10, position: 5 }));

  rerender(allProviders({ isRepeat: true, duration: 10, position: 9.9 }));
  jest.runAllTimers();

  expect(mockSeekToSpotify).toHaveBeenCalledWith(0);
  jest.useRealTimers();
});

mockAudioRef.current.dispatchEvent = jest.fn();

test("ローカル曲の場合、リピートオンでaudio.currentTime = 0になるか", async () => {
  jest.useFakeTimers();
  const { rerender } = render(allProviders({ isRepeat: true, duration: 10, position: 5, isLocalPlaying: true }));

  rerender(allProviders({ isRepeat: true, duration: 10, position: 9.9, isLocalPlaying: true }));
  mockAudioRef.current.listeners["ended"] && mockAudioRef.current.listeners["ended"]();

  jest.runAllTimers();

  expect(mockAudioRef.current.currentTime).toBe(0);
  expect(mockAudioRef.current.play).toHaveBeenCalled();

  jest.useRealTimers();
});

test("Spotify曲の場合、0.2秒以下で次の曲へ切り替わるか", async () => {
  jest.useFakeTimers();
  const { rerender } = render(allProviders({ currentTime: 5000, isTrackSet: true, duration: 10000, position: 5000 }));

  rerender(allProviders({ currentTime: 9900, isTrackSet: true, duration: 10000, position: 9900 }));
  jest.runAllTimers();

  expect(mockGoToNextTrack).toHaveBeenCalled();
  jest.useRealTimers();
});

test("ローカル曲の場合、0.2秒以下で次の曲へ切り替わるか", async () => {
  jest.useFakeTimers();
  const { rerender } = render(allProviders({ duration: 10000, position: 5000, isLocalPlaying: true }));

  rerender(allProviders({ duration: 10000, position: 9900, isLocalPlaying: true }));
  mockAudioRef.current.listeners["ended"] && mockAudioRef.current.listeners["ended"]();
  jest.runAllTimers();

  expect(mockGoToNextTrack).toHaveBeenCalled();
  jest.useRealTimers();
});
