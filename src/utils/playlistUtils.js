export async function getPlaylistInfo(currentPlaylistId, setPlaylistInfo, showMessage) {
  const cachedPlaylistInfo = localStorage.getItem(`playlistDetail:${currentPlaylistId}Info`);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  if (cachedPlaylistInfo) {
    setPlaylistInfo(JSON.parse(cachedPlaylistInfo));
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/playlists/${currentPlaylistId}/info`);

    if (!response.ok) {
      getPlaylistInfoFailed(response.status);
      return;
    }

    const data = await response.json();
    localStorage.setItem(`playlistDetail:${currentPlaylistId}Info`, JSON.stringify(data));

    setPlaylistInfo(data);
  } catch (error) {
    getPlaylistInfoFailed(error);
  }

  function getPlaylistInfoFailed(logValue) {
    console.error("プレイリストメタ情報取得失敗: ", logValue);
    localStorage.removeItem(`playlistDetail:${currentPlaylistId}Info`);
    showMessage("fetchPlaylistInfoFailed");
    setPlaylistInfo({ name: "プレイリスト", totalDuration: 0 });
  }
}
