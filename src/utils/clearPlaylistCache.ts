import { STORAGE_KEYS } from "./storageKeys";

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
