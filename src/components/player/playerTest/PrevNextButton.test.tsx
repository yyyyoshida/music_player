import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PrevNextButton from "../PrevNextButton";
import usePlaybackStore from "../../../store/playbackStore";
import useTooltipStore from "../../../store/tooltipStore";

const mockGoToPreviousTrack = jest.fn();
const mockGoToNextTrack = jest.fn();
const mockHandleButtonPress = jest.fn();
const mockHandleMouseEnter = jest.fn();
const mockHandleMouseLeave = jest.fn();
const mockSetTooltipText = jest.fn();

jest.mock("../../../store/playbackStore");
jest.mock("../../../store/tooltipStore");

beforeEach(() => {
  jest.clearAllMocks();

  (usePlaybackStore as unknown as jest.Mock).mockImplementation((selector) =>
    selector({
      goToPreviousTrack: mockGoToPreviousTrack,
      goToNextTrack: mockGoToNextTrack,
      isPrevDisabled: false,
      isNextDisabled: false,
    })
  );

  (useTooltipStore as unknown as jest.Mock).mockImplementation((selector) =>
    selector({
      handleButtonPress: mockHandleButtonPress,
      handleMouseEnter: mockHandleMouseEnter,
      handleMouseLeave: mockHandleMouseLeave,
      setTooltipText: mockSetTooltipText,
    })
  );
});

describe("PrevNextButton", () => {
  test("Prevボタンのクリックとツールチップ呼び出し確認", async () => {
    render(<PrevNextButton type="prev" />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(mockHandleButtonPress).toHaveBeenCalledTimes(1);
    expect(mockGoToPreviousTrack).toHaveBeenCalledTimes(1);

    await userEvent.hover(button);
    expect(mockSetTooltipText).toHaveBeenCalledWith("前へ");
    expect(mockHandleMouseEnter).toHaveBeenCalled();

    await userEvent.unhover(button);
    expect(mockHandleMouseLeave).toHaveBeenCalled();
  });

  test("Nextボタンのクリックとツールチップ呼び出し確認", async () => {
    render(<PrevNextButton type="next" />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(mockHandleButtonPress).toHaveBeenCalledTimes(1);
    expect(mockGoToNextTrack).toHaveBeenCalledTimes(1);

    await userEvent.hover(button);
    expect(mockSetTooltipText).toHaveBeenCalledWith("次へ");
    expect(mockHandleMouseEnter).toHaveBeenCalled();

    await userEvent.unhover(button);
    expect(mockHandleMouseLeave).toHaveBeenCalled();
  });

  beforeEach(() => {
    mockGoToPreviousTrack.mockClear();
    mockGoToNextTrack.mockClear();
    mockHandleButtonPress.mockClear();
    mockHandleMouseEnter.mockClear();
    mockHandleMouseLeave.mockClear();
    mockSetTooltipText.mockClear();
  });

  test("前へボタン無効化テスト", async () => {
    (usePlaybackStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        goToPreviousTrack: mockGoToPreviousTrack,
        goToNextTrack: mockGoToNextTrack,
        isPrevDisabled: true,
        isNextDisabled: false,
      })
    );
    render(<PrevNextButton type="prev" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("disabled");

    await userEvent.click(button);
    expect(mockGoToPreviousTrack).not.toHaveBeenCalled();
  });

  test("Nextボタン無効化テスト", async () => {
    (usePlaybackStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        goToPreviousTrack: mockGoToPreviousTrack,
        goToNextTrack: mockGoToNextTrack,
        isPrevDisabled: false,
        isNextDisabled: true,
      })
    );

    render(<PrevNextButton type="next" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("disabled");

    await userEvent.click(button);
    expect(mockGoToNextTrack).not.toHaveBeenCalled();
  });
});
