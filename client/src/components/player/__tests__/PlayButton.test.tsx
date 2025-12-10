import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlayButton from "../PlayButton";
import usePlayerStore from "../../../store/playerStore";

jest.mock("../../../store/playerStore");

describe("PlayButton", () => {
  const togglePlayPauseMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (usePlayerStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        isPlaying: false,
        togglePlayPause: togglePlayPauseMock,
      })
    );
  });

  test("クリックするとtogglePlayPause関数が呼ばれる", async () => {
    render(<PlayButton />);
    const button = screen.getByRole("button");
    userEvent.click(button);

    expect(togglePlayPauseMock).toHaveBeenCalledTimes(1);
  });
});
