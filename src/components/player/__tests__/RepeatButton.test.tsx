import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RepeatButton from "../RepeatButton";

import useRepeatStore from "../../../store/repeatStore";
import useTooltipStore from "../../../store/tooltipStore";

jest.mock("../../../store/repeatStore");
jest.mock("../../../store/tooltipStore");

const mockToggleRepeat = jest.fn();
// 呼ばれたら落ちないように空関数でモック ↓
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

function renderRepeat(isRepeatValue: boolean) {
  (useRepeatStore as unknown as jest.Mock).mockImplementation((selector) =>
    selector({
      isRepeat: isRepeatValue,
      toggleRepeat: mockToggleRepeat,
    })
  );
  render(<RepeatButton />);
}

describe("RepeatButton", () => {
  test("リピート：オフ時に押すとtoggleRepeat関数が呼ばれる", async () => {
    renderRepeat(false);
    const button = screen.getByRole("button");

    userEvent.click(button);
    expect(mockToggleRepeat).toHaveBeenCalledTimes(1);
  });

  test("リピート：オン時に押すとtoggleRepeat関数が呼ばれる", async () => {
    renderRepeat(true);
    const button = screen.getByRole("button");

    userEvent.click(button);
    expect(mockToggleRepeat).toHaveBeenCalledTimes(1);
  });
});
