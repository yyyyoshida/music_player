export const STORAGE_KEYS = {
  TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  TOKEN_EXPIRY: "access_token_expiry",

  SEARCH_QUERY: "searchQuery",
  IS_MUTED: "isMuted",
  VOLUME: "player_volume",

  SLEEP_TRACKS: "sleepTracks",

  PLAYLISTS: "playlists",

  getCachedTracksKey: (id: string) => `playlistDetail:${id}Tracks`,
  getCachedPlaylistInfoKey: (id: string) => `playlistDetail:${id}Info`,
};
