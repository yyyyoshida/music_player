const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const API = {
  // Playlists

  playlistSpotifyTracks: (playlistId: string) => `${BASE_URL}/api/playlists/${playlistId}/spotify-tracks`,
  playlistLocalTracks: (playlistId: string) => `${BASE_URL}/api/playlists/${playlistId}/local-tracks`,
  playlistNewLocalTracks: (playlistId: string) => `${BASE_URL}/api/playlists/${playlistId}/local-tracks/new`,
  fetchPlaylistTracks: (playlistId: string) => `${BASE_URL}/api/playlists/${playlistId}/tracks`,
  deleteTrack: (playlistId: string, trackId: string) =>
    `${BASE_URL}/api/playlists/${playlistId}/tracks/${trackId}`,
  PLAYLISTS: `${BASE_URL}/api/playlists`, // 一覧取得・作成
  playlist: (playlistId: string) => `${BASE_URL}/api/playlists/${playlistId}`, // 名前変更・削除
  playlistInfo: (playlistId: string) => `${BASE_URL}/api/playlists/${playlistId}/info`, //プレイリストの詳細取得

  // スリープ機能
  SLEEP_SPOTIFY_TRACKS: `${BASE_URL}/api/sleep/spotify-tracks`,

  // Spotify

  spotifySearch: (query: string) => `https://api.spotify.com/v1/search?q=${query}&type=track&limit=50`,
  spotifyTrackPlay: (deviceId: string) => `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
  SPOTIFY_ME: "https://api.spotify.com/v1/me",

  // Tokens

  EXCHANGE_TOKEN_URL: `${BASE_URL}/api/exchange_token`,
  NEW_TOKEN_URL: `${BASE_URL}/api/refresh_token`,
  NEW_REFRESH_TOKEN_URL: `${BASE_URL}/api/get_refresh_token`,
  SAVE_REFRESH_TOKEN_URL: `${BASE_URL}/api/save_refresh_token`,
};
