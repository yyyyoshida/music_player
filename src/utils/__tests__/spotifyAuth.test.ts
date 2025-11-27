import { getNewAccessToken } from "../spotifyAuth";

import { STORAGE_KEYS } from "../storageKeys";

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();

  global.fetch = jest.fn();
});

describe("getNewAccessToken", () => {
  test("新しいアクセストークンを取得して保存する", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "new-access-token",
          refresh_token: "new-refresh-token",
          expires_in: 3600,
        }),
    });

    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, "old-refresh-token");

    const token = await getNewAccessToken();

    expect(token).toBe("new-access-token");
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBe("new-access-token");
    expect(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)).toBe("new-refresh-token");

    const expiry = Number(localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY));
    expect(expiry).toBeGreaterThan(Date.now());
  });

  test("リフレッシュトークンがない場合はエラーを投げる", async () => {
    await expect(getNewAccessToken()).rejects.toThrow("リフレッシュトークンが存在しない");
  });

  test("fetchが失敗した場合はエラーを投げる", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, "invalid-refresh-token");

    await expect(getNewAccessToken()).rejects.toThrow("アクセストークンの更新に失敗しました");
  });
});
