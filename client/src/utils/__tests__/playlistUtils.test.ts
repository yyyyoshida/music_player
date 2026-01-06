import { getPlaylistInfo } from "../../features/playlist/playlistActions";
import { STORAGE_KEYS } from "../storageKeys";

const ONE_MINUTE = 60 * 1000;

const playlistId = "123";
const cachedData = { name: "プレイリスト１", totalDuration: ONE_MINUTE };
const fetchedData = { name: "プレイリスト２", totalDuration: 2 * ONE_MINUTE };
let setPlaylistInfoMock = jest.fn();
let showMessageMock = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();

  setPlaylistInfoMock = jest.fn();
  showMessageMock = jest.fn();
  global.fetch = jest.fn();
});

describe("getPlaylistInfo", () => {
  test("キャッシュが存在する場合、APIを呼ばずにキャッシュを返す", async () => {
    localStorage.setItem(STORAGE_KEYS.getCachedPlaylistInfoKey(playlistId), JSON.stringify(cachedData));
    const result = await getPlaylistInfo(playlistId, setPlaylistInfoMock, showMessageMock);

    expect(result).toEqual(cachedData);
    expect(setPlaylistInfoMock).toHaveBeenCalledWith(cachedData);
  });

  test("キャッシュがなく、APIから正常にデータを取得できてキャッシュに保存", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fetchedData),
    });

    const result = await getPlaylistInfo(playlistId, setPlaylistInfoMock, showMessageMock);
    const newCachedData = localStorage.getItem(STORAGE_KEYS.getCachedPlaylistInfoKey(playlistId));

    expect(result).toEqual(fetchedData);
    expect(newCachedData).toEqual(JSON.stringify(fetchedData));
    expect(setPlaylistInfoMock).toHaveBeenCalledWith(fetchedData);
  });

  test("APIからの取得が失敗した場合、デフォルト値を返す", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await getPlaylistInfo(playlistId, setPlaylistInfoMock, showMessageMock);

    expect(result).toEqual({ name: "プレイリスト", totalDuration: 0 });
    expect(showMessageMock).toHaveBeenCalledWith("fetchPlaylistInfoFailed");
    expect(setPlaylistInfoMock).toHaveBeenCalledWith({ name: "プレイリスト", totalDuration: 0 });
  });
});
