import { STORAGE_KEYS } from "../../utils/storageKeys";
import type { SpotifyTrack } from "../../types/tracksType";

type PlaylistsCache = {
  id: string;
  name: string;
  totalDuration: number;
  trackCount: number;
  albumImages: string[];
}[];

export function getPlaylistsCache(): PlaylistsCache {
  const cached = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
  return cached ? JSON.parse(cached) : [];
}

export function updatePlaylistsCacheFromSleep(playlistId: string, track: SpotifyTrack) {
  const cachedPlaylists = getPlaylistsCache();

  if (cachedPlaylists) {
    const updatedPlaylists = cachedPlaylists.map((playlist) => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          totalDuration: playlist.totalDuration + Number(track.duration_ms),
          trackCount: playlist.trackCount + 1,
          albumImages: [track.albumImage, ...playlist.albumImages].slice(0, 4),
        };
      }
      return playlist;
    });

    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(updatedPlaylists));
  }
}

export function clearPlaylistCache(id: string): void {
  clearPlaylistsCache();
  clearPlaylistDetailCache(id);
}

export function clearPlaylistDetailCache(id: string): void {
  localStorage.removeItem(STORAGE_KEYS.getCachedTracksKey(id));
  localStorage.removeItem(STORAGE_KEYS.getCachedPlaylistInfoKey(id));
}

export function clearPlaylistsCache(): void {
  localStorage.removeItem(STORAGE_KEYS.PLAYLISTS);
}

// プレイリスト詳細のキャッシュ操作

export function getPlaylistInfoCache(id: string) {
  const cached = localStorage.getItem(STORAGE_KEYS.getCachedPlaylistInfoKey(id));

  return cached ? JSON.parse(cached) : null;
}

export function setPlaylistInfoCache(id: string, data: any) {
  localStorage.setItem(STORAGE_KEYS.getCachedPlaylistInfoKey(id), JSON.stringify(data));
}

export function clearPlaylistInfoCache(id: string) {
  localStorage.removeItem(STORAGE_KEYS.getCachedPlaylistInfoKey(id));
}
