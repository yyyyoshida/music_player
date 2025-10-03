export async function getPlaylistInfo(
  currentPlaylistId: string,
  setPlaylistInfo: (info: { name: string; totalDuration: number }) => void,
  showMessage: (key: string) => void
): Promise<{ name: string; totalDuration: number }> {
  const cachedPlaylistInfo = localStorage.getItem(`playlistDetail:${currentPlaylistId}Info`);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  if (cachedPlaylistInfo) {
    setPlaylistInfo(JSON.parse(cachedPlaylistInfo));
    return JSON.parse(cachedPlaylistInfo);
  }

  try {
    const response = await fetch(`${BASE_URL}/api/playlists/${currentPlaylistId}/info`);

    if (!response.ok) {
      throw new Error(String(response.status));
    }

    const data = await response.json();
    localStorage.setItem(`playlistDetail:${currentPlaylistId}Info`, JSON.stringify(data));

    setPlaylistInfo(data);
    return data;
  } catch (error) {
    getPlaylistInfoFailed(error);
    return { name: "プレイリスト", totalDuration: 0 };
  }

  function getPlaylistInfoFailed(logValue: any) {
    console.error("プレイリストメタ情報取得失敗: ", logValue);
    localStorage.removeItem(`playlistDetail:${currentPlaylistId}Info`);
    showMessage("fetchPlaylistInfoFailed");
    setPlaylistInfo({ name: "プレイリスト", totalDuration: 0 });
  }
}
