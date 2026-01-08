import {
  getNewAccessToken,
  saveRefreshToken,
  getRefreshToken,
  isValidToken,
} from "../../features/spotify/spotifyService";

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

describe("saveRefreshToken", () => {
  test("成功時にエラーを投げずに終了する", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await expect(saveRefreshToken("new-refresh-token")).resolves.toBeUndefined();
  });

  test("fetchが失敗した場合はエラーを投げる", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });
    await expect(saveRefreshToken("invalid-refresh-token")).rejects.toThrow("リフレッシュトークン保存に失敗");
  });
});

describe("getRefreshToken", () => {
  test("成功時にリフレッシュトークンを返す", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ refresh_token: "new-refresh-token" }),
    });

    const refreshToken = await getRefreshToken();
    expect(refreshToken).toBe("new-refresh-token");
  });

  test("fetchが失敗した場合はエラーを投げる", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });
    await expect(getRefreshToken()).rejects.toThrow("リフレッシュトークン取得に失敗");
  });
});

const ONE_SECOND_MS = 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;

describe("isValidToken", () => {
  test("トークンの期限がない場合はfalseを返す", () => {
    expect(isValidToken()).toBe(false);
  });

  test("トークンの期限が5分以上残ってる場合はtrueを返す", () => {
    const validTime = Date.now() + FIVE_MINUTES_MS + ONE_SECOND_MS;
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, String(validTime));
    expect(isValidToken()).toBe(true);
  });

  test("トークンの期限が過ぎている場合はfalseを返す", () => {
    const expiredTime = Date.now() - ONE_SECOND_MS;

    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, String(expiredTime));
    expect(isValidToken()).toBe(false);
  });

  test("トークンの期限が5分以内に切れる場合はfalseを返す", () => {
    const expiringSoonTime = Date.now() + FIVE_MINUTES_MS - ONE_SECOND_MS;

    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, String(expiringSoonTime));
    expect(isValidToken()).toBe(false);
  });
});
