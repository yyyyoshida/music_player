import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VolumeBar from "../VolumeBar";

import usePlayerStore from "../../../store/playerStore";
import useTooltipStore from "../../../store/tooltipStore";

jest.mock("../../../store/playerStore");
jest.mock("../../../store/tooltipStore");

const mockUpdateVolume = jest.fn();

const mockHandleButtonPress = jest.fn();
const mockHandleMouseEnter = jest.fn();
const mockHandleMouseLeave = jest.fn();
const mockSetTooltipText = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  (useTooltipStore as unknown as jest.Mock).mockImplementation((selector) =>
    selector({
      handleButtonPress: mockHandleButtonPress,
      handleMouseEnter: mockHandleMouseEnter,
      handleMouseLeave: mockHandleMouseLeave,
      setTooltipText: mockSetTooltipText,
    })
  );
});

function setupVolumeBar(initialValue: number = 30) {
  const audioRef = { current: { volume: 0.5 } };
  (usePlayerStore as unknown as jest.Mock).mockImplementation((selector) =>
    selector({
      playerReady: true,
      updateVolume: mockUpdateVolume,
      audioRef: audioRef,
    })
  );
  render(<VolumeBar initialValue={initialValue} />);

  return audioRef;
}

describe("VolumeBarコンポーネントテスト", () => {
  test("ミュートしたら音量が0になる", async () => {
    const audioRef = setupVolumeBar();
    userEvent.click(screen.getByRole("button"));

    // ローカル曲用の処理
    expect(audioRef.current.volume).toBe(0);
    // Spotify用の処理
    expect(mockUpdateVolume).toHaveBeenCalledWith(0);
  });
});
