import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlayButton from "../PlayButton";

const mockTogglePlayPause = jest.fn();
const mockHandleButtonPress = jest.fn();
const mockHandleMouseEnter = jest.fn();
const mockHandleMouseLeave = jest.fn();
const mockSetTooltipText = jest.fn();

jest.mock("../../../contexts/PlayerContext", () => ({
  usePlayerContext: () => ({
    isPlayPauseCooldown: false,
    isPlaying: false,
    togglePlayPause: mockTogglePlayPause,
  }),
}));

import { TooltipContext } from "../../../contexts/TooltipContext";

const TooltipProviderWrapper = ({ children }) => (
  <TooltipContext.Provider
    value={{
      handleButtonPress: mockHandleButtonPress,
      handleMouseEnter: mockHandleMouseEnter,
      handleMouseLeave: mockHandleMouseLeave,
      setTooltipText: mockSetTooltipText,
    }}
  >
    {children}
  </TooltipContext.Provider>
);

test("再生ボタンをクリックして再生できる", async () => {
  render(
    <TooltipProviderWrapper>
      <PlayButton />
    </TooltipProviderWrapper>
  );

  const button = screen.getByRole("button");
  expect(button).toBeInTheDocument();

  await userEvent.click(button);
  expect(mockTogglePlayPause).toHaveBeenCalledTimes(1);
  expect(mockHandleButtonPress).toHaveBeenCalledTimes(1);

  await userEvent.hover(button);
  expect(mockSetTooltipText).toHaveBeenCalledWith("再生");
  expect(mockHandleMouseEnter).toHaveBeenCalled();

  await userEvent.unhover(button);
  expect(mockHandleMouseLeave).toHaveBeenCalled();
});
