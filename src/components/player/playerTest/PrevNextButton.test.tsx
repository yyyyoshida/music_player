import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PrevNextButton from "../PrevNextButton";
import usePlaybackStore from "../../../store/playbackStore";

jest.mock("../../../store/playbackStore");

describe("PrevNextButton", () => {
  const mockGoToPreviousTrack = jest.fn();
  const mockGoToNextTrack = jest.fn();

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
  });

  test("前ボタンが無効時は処理が呼ばれない", async () => {
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

    userEvent.click(button);
    expect(mockGoToPreviousTrack).not.toHaveBeenCalled();
  });

  test("次ボタンが無効時は処理が呼ばれない", async () => {
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

    userEvent.click(button);
    expect(mockGoToNextTrack).not.toHaveBeenCalled();
  });
});
