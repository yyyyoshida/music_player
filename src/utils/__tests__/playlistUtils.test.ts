import { getPlaylistInfo } from "../playlistUtils";
import { STORAGE_KEYS } from "../storageKeys";
import type { ActionType } from "../../types/actionType";

const ONE_MINUTE = 60 * 1000;

const playlistId = "123";
const cachedData = { name: "プレイリスト", totalDuration: ONE_MINUTE };
const fetchedData = { name: "プレイリスト", totalDuration: 2 * ONE_MINUTE };
const setPlaylistInfoMock = jest.fn();
const showMessageMock = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("getPlaylistInfo", () => {
  test("キャッシュが存在する場合、キャッシュからデータを取得する", async () => {
    localStorage.setItem(STORAGE_KEYS.getCachedPlaylistInfoKey(playlistId), JSON.stringify(cachedData));
    const result = await getPlaylistInfo(playlistId, setPlaylistInfoMock, showMessageMock);

    expect(result).toEqual(cachedData);
    expect(setPlaylistInfoMock).toHaveBeenCalledWith(cachedData);
  });
});
