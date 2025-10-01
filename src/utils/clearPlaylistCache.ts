export function clearPlaylistCache(id: string): void {
  clearPlaylistsCache();
  clearPlaylistDetailCache(id);
}

export function clearPlaylistDetailCache(id: string): void {
  localStorage.removeItem(`playlistDetail:${id}Tracks`);
  localStorage.removeItem(`playlistDetail:${id}Info`);
}

export function clearPlaylistsCache(): void {
  localStorage.removeItem("playlists");
}
