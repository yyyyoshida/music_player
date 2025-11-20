import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RepeatButton from "../RepeatButton";

import useRepeatStore from "../../../store/repeatStore";
import useTooltipStore from "../../../store/tooltipStore";

jest.mock("../../../store/repeatStore");
jest.mock("../../../store/tooltipStore");

const mockToggleRepeat = jest.fn();
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

function testRepeatButton(isRepeatValue: boolean, expectedTooltipText: any) {
  test(`Repeatが${isRepeatValue ? "オン" : "オフ"}のときのボタン動作とツールチップ呼び出し確認`, async () => {
    (useRepeatStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        isRepeat: isRepeatValue,
        toggleRepeat: mockToggleRepeat,
      })
    );

    render(<RepeatButton />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(mockToggleRepeat).toHaveBeenCalledTimes(1);
    expect(mockHandleButtonPress).toHaveBeenCalledTimes(1);

    await userEvent.hover(button);
    expect(mockSetTooltipText).toHaveBeenCalledWith(expectedTooltipText);
    expect(mockHandleMouseEnter).toHaveBeenCalled();

    await userEvent.unhover(button);
    expect(mockHandleMouseLeave).toHaveBeenCalled();
  });
}

testRepeatButton(true, "リピート：オン");
testRepeatButton(false, "リピート：オフ");
