import { fetchSpotifyAPI } from "../../features/spotify/spotifyService";
import { STORAGE_KEYS } from "../storageKeys";

describe("fetchSpotifyAPI", () => {
  const TEST_URL = "http://test/hogehogehoge";

  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
    });
  });

  test("getNewAccessTokenFnが失敗した場合、エラーを投げる", async () => {
    const mockIsValid = jest.fn(() => false);
    const mockGetNewToken = jest.fn(async () => {
      throw new Error("リフレッシュトークンが存在しない");
    });

    localStorage.setItem(STORAGE_KEYS.TOKEN, "old-token");
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, "refresh-token");

    await expect(fetchSpotifyAPI(TEST_URL, {}, mockIsValid, mockGetNewToken)).rejects.toThrow(
      "TOKEN_REFRESH_FAILED"
    );

    expect(mockIsValid).toHaveBeenCalled();
    expect(mockGetNewToken).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("getNewAccessTokenFn が null を返した場合、エラーを投げる", async () => {
    const mockIsValid = jest.fn(() => false);
    const mockGetNewToken = jest.fn(async () => null as unknown as string);
    localStorage.setItem(STORAGE_KEYS.TOKEN, "old-token");
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, "refresh-token");

    await expect(fetchSpotifyAPI(TEST_URL, {}, mockIsValid, mockGetNewToken)).rejects.toThrow(
      "TOKEN_REFRESH_FAILED"
    );

    expect(mockIsValid).toHaveBeenCalled();
    expect(mockGetNewToken).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("getNewAccessTokenFn が空文字を返した場合 TOKEN_REFRESH_FAILED を投げる", async () => {
    const mockIsValid = jest.fn(() => false);
    const mockGetNewToken = jest.fn(async () => "");

    localStorage.setItem(STORAGE_KEYS.TOKEN, "old-token");

    await expect(fetchSpotifyAPI(TEST_URL, {}, mockIsValid, mockGetNewToken)).rejects.toThrow(
      "TOKEN_REFRESH_FAILED"
    );

    expect(mockIsValid).toHaveBeenCalled();
    expect(mockGetNewToken).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("fetchが例外を投げた場合、その例外を伝播させる", async () => {
    const mockIsValid = jest.fn(() => true);
    const mockGetNewToken = jest.fn();

    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
    localStorage.setItem(STORAGE_KEYS.TOKEN, "valid-token");

    await expect(fetchSpotifyAPI(TEST_URL, {}, mockIsValid, mockGetNewToken)).rejects.toThrow(
      "Network error"
    );

    expect(mockIsValid).toHaveBeenCalled();
    expect(mockGetNewToken).not.toHaveBeenCalled();
  });

  test("option引数が渡された場合、それをfetchに渡す", async () => {
    const mockIsValid = jest.fn(() => true);
    const mockGetNewToken = jest.fn();
    localStorage.setItem(STORAGE_KEYS.TOKEN, "valid-token");

    const options = {
      headers: { "X-Test-Header": "test-value", Authorization: "old-token" },
    };

    await fetchSpotifyAPI(TEST_URL, options, mockIsValid, mockGetNewToken);

    expect(global.fetch).toHaveBeenCalledWith(TEST_URL, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: "Bearer valid-token",
      },
    });
  });

  test("トークンが有効なら更新せずに既存のトークンで fetch する", async () => {
    const mockIsValid = jest.fn(() => true);
    const mockGetNewToken = jest.fn();

    localStorage.setItem(STORAGE_KEYS.TOKEN, "valid-token");

    const response = await fetchSpotifyAPI(TEST_URL, {}, mockIsValid, mockGetNewToken);

    expect(mockIsValid).toHaveBeenCalled();
    expect(mockGetNewToken).not.toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(TEST_URL, {
      headers: { Authorization: "Bearer valid-token" },
    });
    expect(response).toEqual({ ok: true });
  });

  test("トークンが無効なら更新して新しいトークンで fetch する", async () => {
    const mockIsValid = jest.fn(() => false);
    const mockGetNewToken = jest.fn(async () => "new-access-token");

    localStorage.setItem(STORAGE_KEYS.TOKEN, "old-token");
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, "refresh-token");

    const response = await fetchSpotifyAPI(TEST_URL, {}, mockIsValid, mockGetNewToken);

    expect(mockIsValid).toHaveBeenCalled();
    expect(mockGetNewToken).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(TEST_URL, {
      headers: { Authorization: "Bearer new-access-token" },
    });
    expect(response).toEqual({ ok: true });
  });
});
