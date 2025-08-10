export function clearPlaylistCache(id) {
  clearPlaylistsCache();
  clearPlaylistDetailCache(id);
}

export function clearPlaylistDetailCache(id) {
  localStorage.removeItem(`playlistDetail:${id}Tracks`);
  localStorage.removeItem(`playlistDetail:${id}Info`);
}

export function clearPlaylistsCache() {
  localStorage.removeItem("playlists");
}
