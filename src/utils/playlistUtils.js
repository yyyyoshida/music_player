export async function getPlaylistInfo(currentPlaylistId) {
  const cachedPlaylistInfo = localStorage.getItem(`playlistDetail:${currentPlaylistId}Info`);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  if (cachedPlaylistInfo) {
    return JSON.parse(cachedPlaylistInfo);
  }

  const response = await fetch(`${BASE_URL}/api/playlists/${currentPlaylistId}/info`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch playlist info: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  localStorage.setItem(`playlistDetail:${currentPlaylistId}Info`, JSON.stringify(data));
  return data;
}
