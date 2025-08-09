import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VolumeBar from "../VolumeBar";
import PlayerContext from "../../../contexts/PlayerContext";
import { TooltipContext } from "../../../contexts/TooltipContext";
import useBarHandler from "../../../hooks/useBarHandler";

jest.mock("../../../hooks/useBarHandler", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockHandleMouseDown = jest.fn();
const mockUpdateVolume = jest.fn();

const mockHandleButtonPress = jest.fn();
const mockHandleMouseEnter = jest.fn();
const mockHandleMouseLeave = jest.fn();
const mockSetTooltipText = jest.fn();

function RenderAllProviders({ initialValue = 30 } = {}) {
  const mockAudioRef = { current: { volume: 0.5 } };
  return render(
    <PlayerContext.Provider
      value={{
        playerReady: true,
        updateVolume: mockUpdateVolume,
        audioRef: mockAudioRef,
      }}
    >
      <TooltipContext.Provider
        value={{
          handleButtonPress: mockHandleButtonPress,
          handleMouseEnter: mockHandleMouseEnter,
          handleMouseLeave: mockHandleMouseLeave,
          setTooltipText: mockSetTooltipText,
        }}
      >
        <VolumeBar initialValue={initialValue} />
      </TooltipContext.Provider>
    </PlayerContext.Provider>
  );
}

beforeEach(() => {
  localStorage.clear();
  useBarHandler.mockReturnValue({
    percentage: 30,
    setPercentage: jest.fn(),
    handleMouseDown: mockHandleMouseDown,
  });
});

test("ボタンをクリックするとupdateVolume(0)が呼ばれる（ミュート）", async () => {
  RenderAllProviders();

  const button = screen.getByRole("button");
  await userEvent.click(button);
  expect(mockUpdateVolume).toHaveBeenCalledWith(0);
});

test("初期レンダリング時にlocalStorageの値が反映される", () => {
  localStorage.setItem("player_volume", "30");
  localStorage.setItem("isMuted", "false");

  RenderAllProviders();

  expect(mockUpdateVolume).toHaveBeenCalledWith(0.3);
});

test("ホバーでsetTooltipTextが呼ばれる", async () => {
  RenderAllProviders();
  const button = screen.getByRole("button");
  await userEvent.hover(button);

  expect(mockSetTooltipText).toHaveBeenCalledWith(expect.stringMatching(/ミュート/));
});
test("音量バーのドラッグ操作でhandleMouseDownが呼ばれる", async () => {
  RenderAllProviders();

  const bar = document.querySelector(".player-controls__volume-bar--wrapper");
  fireEvent.mouseDown(bar);

  expect(mockHandleMouseDown).toHaveBeenCalled();
});

test("ミュート解除したときに音量が戻る", async () => {
  localStorage.setItem("isMuted", "true");
  localStorage.setItem("player_volume", "30");

  RenderAllProviders();

  const button = screen.getByRole("button");
  await userEvent.click(button);

  expect(mockUpdateVolume).toHaveBeenCalledWith(0.3);
});

test("initialValueが反映される", () => {
  useBarHandler.mockReturnValueOnce({
    percentage: 50,
    setPercentage: jest.fn(),
    handleMouseDown: mockHandleMouseDown,
  });

  RenderAllProviders({ initialValue: 50 });

  const fill = document.querySelector(".player-controls__volume-fill");
  const thumb = document.querySelector(".player-controls__volume-thumb");

  expect(fill).toHaveStyle("width: 50%");
  expect(thumb).toHaveStyle("left: 50%");
});

test("音量変化に応じてUIが更新される", () => {
  useBarHandler.mockReturnValueOnce({
    percentage: 60,
    setPercentage: jest.fn(),
    handleMouseDown: mockHandleMouseDown,
  });

  RenderAllProviders();

  const fill = document.querySelector(".player-controls__volume-fill");
  const thumb = document.querySelector(".player-controls__volume-thumb");

  expect(fill).toHaveStyle("width: 60%");
  expect(thumb).toHaveStyle("left: 60%");
});

test("音量変更時にlocalStorageに保存される", () => {
  const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

  RenderAllProviders();

  expect(setItemSpy).toHaveBeenCalledWith("player_volume", expect.any(Number));
  expect(setItemSpy).toHaveBeenCalledWith("isMuted", expect.any(Boolean));

  setItemSpy.mockRestore();
});

test("音量が audioRef.current.volume に適用される", () => {
  const mockAudioRef = { current: { volume: 0 } };

  render(
    <PlayerContext.Provider
      value={{
        playerReady: true,
        updateVolume: mockUpdateVolume,
        audioRef: mockAudioRef,
      }}
    >
      <TooltipContext.Provider
        value={{
          handleButtonPress: mockHandleButtonPress,
          handleMouseEnter: mockHandleMouseEnter,
          handleMouseLeave: mockHandleMouseLeave,
          setTooltipText: mockSetTooltipText,
        }}
      >
        <VolumeBar initialValue={30} />
      </TooltipContext.Provider>
    </PlayerContext.Provider>
  );

  expect(mockAudioRef.current.volume).toBe(0.3);
});
