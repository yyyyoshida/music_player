import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProgressBar from "../ProgressBar";
import RepeatContext from "../../../contexts/RepeatContext";
import { PlaybackContext } from "../../../contexts/PlaybackContext";
import PlayerContext from "../../../contexts/PlayerContext";
import useBarHandler from "../../../hooks/useBarHandler";
import { TbRectangleRoundedTop } from "react-icons/tb";

jest.mock("../../../hooks/useBarHandler", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockSeekToSpotify = jest.fn();
const mockSetIsPlaying = jest.fn();

const mockGoToNextTrack = jest.fn();

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
  useBarHandler.mockReturnValue({
    percentage: 0,
    setPercentage: mockSetPercentage,
    isDragging: false,
    roundToTwoDecimals: mockRoundToTwoDecimals,
    handleMouseDown: mockHandleMouseDown,
  });
});

function RenderAllProviders(isLocalPlaying = false, visibleLoading = false) {
  return render(
    <RepeatContext.Provider value={{ isRepeat: false }}>
      <PlayerContext.Provider
        value={{
          currentTime: 0,
          isTrackSet: false,
          isLocalReady: false,
          seekToSpotify: mockSeekToSpotify,
          duration: 0,
          position: 0,
          isPlaying: false,
          setIsPlaying: mockSetIsPlaying,
          isLocalPlaying,
          visibleLoading,
          audioRef: mockAudioRef,
        }}
      >
        <PlaybackContext.Provider
          value={{
            goToNextTrack: mockGoToNextTrack,
            currentIndex: 0,
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
  RenderAllProviders();

  const progressFill = document.querySelector(".player-controls__progress-fill");
  expect(progressFill).toBeInTheDocument();
  expect(progressFill).toHaveStyle({ width: "0%" });

  const progressThumb = document.querySelector(".player-controls__progress-thumb");
  expect(progressThumb).toBeInTheDocument();
  expect(progressThumb).toHaveStyle({ left: "0%" });
});

test("isLocalPlaying && visibleLoading のときにローディング表示される", () => {
  RenderAllProviders(true, true);
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

  RenderAllProviders();

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

  RenderAllProviders();

  const progressThumb = document.querySelector(".player-controls__progress-thumb");
  const progressFill = document.querySelector(".player-controls__progress-fill");

  expect(progressThumb).toHaveStyle({ left: "75%" });
  expect(progressFill).toHaveStyle({ width: "75%" });
});

test("positionが変化したときsetPercentageが呼ばれるか(ローカル再生じゃない場合)", async () => {
  const mockRound = jest.fn().mockReturnValue(42);

  useBarHandler.mockReturnValue({
    percentage: 0,
    setPercentage: mockSetPercentage,
    isDragging: false,
    roundToTwoDecimals: mockRound,
    handleMouseDown: mockHandleMouseDown,
  });

  const { rerender } = render(
    <RepeatContext.Provider value={{ isRepeat: false }}>
      <PlayerContext.Provider
        value={{
          currentTime: 0,
          isTrackSet: false,
          isLocalReady: false,
          seekToSpotify: mockSeekToSpotify,
          duration: 100,
          position: 0,
          isPlaying: false,
          setIsPlaying: mockSetIsPlaying,
          isLocalPlaying: false,
          audioRef: mockAudioRef,
        }}
      >
        <PlaybackContext.Provider value={{ goToNextTrack: mockGoToNextTrack, currentIndex: 0 }}>
          <ProgressBar />
        </PlaybackContext.Provider>
      </PlayerContext.Provider>
    </RepeatContext.Provider>
  );

  // position変更
  rerender(
    <RepeatContext.Provider value={{ isRepeat: false }}>
      <PlayerContext.Provider
        value={{
          currentTime: 0,
          isTrackSet: false,
          isLocalReady: false,
          seekToSpotify: mockSeekToSpotify,
          duration: 100,
          position: 10,
          isPlaying: false,
          setIsPlaying: mockSetIsPlaying,
          isLocalPlaying: false,
          audioRef: mockAudioRef,
        }}
      >
        <PlaybackContext.Provider value={{ goToNextTrack: mockGoToNextTrack, currentIndex: 0 }}>
          <ProgressBar />
        </PlaybackContext.Provider>
      </PlayerContext.Provider>
    </RepeatContext.Provider>
  );

  expect(mockRound).toHaveBeenCalledWith(10);
  expect(mockSetPercentage).toHaveBeenCalledWith(42);
});
