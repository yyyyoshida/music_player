import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RepeatButton from "../RepeatButton";
import RepeatContext from "../../../contexts/RepeatContext";
import { TooltipContext } from "../../../contexts/TooltipContext";

const mockToggleRepeat = jest.fn();
const mockHandleButtonPress = jest.fn();
const mockHandleMouseEnter = jest.fn();
const mockHandleMouseLeave = jest.fn();
const mockSetTooltipText = jest.fn();

function RenderAllProviders(isRepeat = true) {
  return render(
    <RepeatContext.Provider
      value={{
        isRepeat,
        toggleRepeat: mockToggleRepeat,
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
        <RepeatButton />
      </TooltipContext.Provider>
    </RepeatContext.Provider>
  );
}

function testRepeatButton(isRepeatValue, expectedTooltipText) {
  test(`Repeatが${isRepeatValue ? "オン" : "オフ"}のときのボタン動作とツールチップ呼び出し確認`, async () => {
    RenderAllProviders(isRepeatValue);

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

beforeEach(() => {
  jest.clearAllMocks();
});

testRepeatButton(true, "リピート：オン");
testRepeatButton(false, "リピート：オフ");
