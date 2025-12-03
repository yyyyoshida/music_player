import { updatePlaylistsCacheFromSleep } from "../playlistCache";
import { STORAGE_KEYS } from "../storageKeys";
import type { SpotifyTrack } from "../../types/tracksType";

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;

const trackToRestore: SpotifyTrack = {
  addedAt: "1000",
  albumImage: "img-A",
  artist: "artist",
  duration_ms: ONE_MINUTE,
  trackId: "trackId",
  id: "A",
  title: "title",
  source: "spotify",
  trackUri: "trackUri",
};

const basePlaylistsCache = [
  { id: "A", totalDuration: ONE_MINUTE, trackCount: 1, albumImages: ["img-A"] },
  { id: "B", totalDuration: 3 * ONE_MINUTE, trackCount: 3, albumImages: ["img-B"] },
];

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

// スリープした曲を元のプレイリストに復元時に一致するIDのプレイリストのキャッシュを更新する関数のテスト
describe("updatePlaylistsCacheFromSleep", () => {
  test("一致するIDのプレイリストだけに曲が追加される", () => {
    const mockPlaylistsCache = JSON.parse(JSON.stringify(basePlaylistsCache));
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(mockPlaylistsCache));

    updatePlaylistsCacheFromSleep("B", trackToRestore);
    const result = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYLISTS)!);

    expect(result[0]).toEqual(mockPlaylistsCache[0]);

    expect(result[1]).toEqual({
      id: "B",
      totalDuration: 4 * ONE_MINUTE,
      trackCount: 3 + 1,
      albumImages: [trackToRestore.albumImage, "img-B"].slice(0, 4),
    });
  });

  test("一致するIDのプレイリストがない場合、キャッシュは変更されない", () => {
    const mockPlaylistsCache = JSON.parse(JSON.stringify(basePlaylistsCache));
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(mockPlaylistsCache));

    updatePlaylistsCacheFromSleep("C", trackToRestore);
    const result = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYLISTS)!);

    expect(result).toEqual(mockPlaylistsCache);
  });
});
