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

describe("VolumeBarコンポーネントテスト", () => {});
