import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PrevNextButton from "../PrevNextButton";
import { PlaybackContext } from "../../../contexts/PlaybackContext";
import { TooltipContext } from "../../../contexts/TooltipContext";

const mockGoToPreviousTrack = jest.fn();
const mockGoToNextTrack = jest.fn();
const mockHandleButtonPress = jest.fn();
const mockHandleMouseEnter = jest.fn();
const mockHandleMouseLeave = jest.fn();
const mockSetTooltipText = jest.fn();

function RenderAllProviders({ type }) {
  return render(
    <PlaybackContext.Provider
      value={{
        goToPreviousTrack: mockGoToPreviousTrack,
        goToNextTrack: mockGoToNextTrack,
        isPrevDisabled: false,
        isNextDisabled: false,
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
        <PrevNextButton type={type} />
      </TooltipContext.Provider>
    </PlaybackContext.Provider>
  );
}

test("Prevボタンのクリックとツールチップ呼び出し確認", async () => {
  RenderAllProviders({ type: "prev" });

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
  RenderAllProviders({ type: "next" });

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

function renderWithDisabled(type, isDisabled) {
  return render(
    <PlaybackContext.Provider
      value={{
        goToPreviousTrack: mockGoToPreviousTrack,
        goToNextTrack: mockGoToNextTrack,
        isPrevDisabled: type === "prev" ? isDisabled : false,
        isNextDisabled: type === "next" ? isDisabled : false,
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
        <PrevNextButton type={type} />
      </TooltipContext.Provider>
    </PlaybackContext.Provider>
  );
}

test("前へボタン無効化テスト", async () => {
  renderWithDisabled("prev", true);
  const button = screen.getByRole("button");
  expect(button).toHaveClass("disabled");

  await userEvent.click(button);
  expect(mockGoToPreviousTrack).not.toHaveBeenCalled();
});

test("Nextボタン無効化テスト", async () => {
  renderWithDisabled("next", true);
  const button = screen.getByRole("button");
  expect(button).toHaveClass("disabled");

  await userEvent.click(button);
  expect(mockGoToNextTrack).not.toHaveBeenCalled();
});
