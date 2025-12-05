import type { ActionType } from "../types/actionType";
import { API } from "../api/apis";
import { STORAGE_KEYS } from "./storageKeys";
import validatePlaylistName from "./validatePlaylistName";

type CreatePlaylistActions = {
  hideCreatePlaylistModal: () => void;
  triggerError: (msg: string) => void;
  setPreselectedTrack: (val: any) => void;
  setRefreshTrigger: (updater: (prev: number) => number) => void;
  closePlaylistSelectModal: () => void;
  showMessage: (msg: ActionType) => void;
};

export async function handleCreatePlaylist(name: string, actions: CreatePlaylistActions): Promise<void> {
  const validationError = validatePlaylistName(name);

  if (validationError) {
    return actions.triggerError(validationError);
  }

  try {
    const response = await fetch(API.PLAYLISTS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      try {
        const data = await response.json();
        actions.triggerError(data.error);
      } catch (error) {
        // バリデーション以外のエラー
        console.error("プレイリスト名バリデーション以外のエラー", error);
        actions.showMessage("newPlaylistFailed");
        actions.hideCreatePlaylistModal();
      }
      return;
    }

    actions.showMessage("newPlaylist");
    actions.setPreselectedTrack(null);
    actions.setRefreshTrigger((prev) => prev + 1);
    actions.closePlaylistSelectModal();
    actions.hideCreatePlaylistModal();
  } catch {
    actions.showMessage("newPlaylistFailed");
    actions.hideCreatePlaylistModal();
  }
}

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
    const response = await fetch(API.playlistInfo(currentPlaylistId));

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
