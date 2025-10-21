import type { ActionType } from "../types/actionType";
import { API } from "../api/apis";
import { STORAGE_KEYS } from "./storageKeys";

export async function getPlaylistInfo(
  currentPlaylistId: string,
  setPlaylistInfo: (info: { name: string; totalDuration: number }) => void,
  showMessage: (key: ActionType) => void
): Promise<{ name: string; totalDuration: number }> {
  const cachedPlaylistInfo = localStorage.getItem(STORAGE_KEYS.getCachedPlaylistInfoKey(currentPlaylistId));

  if (cachedPlaylistInfo) {
    setPlaylistInfo(JSON.parse(cachedPlaylistInfo));
    return JSON.parse(cachedPlaylistInfo);
  }

  try {
    const response = await fetch(API.PLAYLIST_INFO(currentPlaylistId));

    if (!response.ok) {
      throw new Error(String(response.status));
    }

    const data = await response.json();
    localStorage.setItem(STORAGE_KEYS.getCachedPlaylistInfoKey(currentPlaylistId), JSON.stringify(data));

    setPlaylistInfo(data);
    return data;
  } catch (error) {
    getPlaylistInfoFailed(error);
    return { name: "プレイリスト", totalDuration: 0 };
  }

  function getPlaylistInfoFailed(logValue: any) {
    console.error("プレイリストメタ情報取得失敗: ", logValue);
    localStorage.removeItem(STORAGE_KEYS.getCachedPlaylistInfoKey(currentPlaylistId));
    showMessage("fetchPlaylistInfoFailed");
    setPlaylistInfo({ name: "プレイリスト", totalDuration: 0 });
  }
}
