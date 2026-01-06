import type { ActionType } from "../types/actionType";
import type { TrackObject } from "../types/tracksType";
import { API } from "../api/apis";
import { STORAGE_KEYS } from "./storageKeys";
import validatePlaylistName from "./validatePlaylistName";
import { createPlaylist } from "../features/playlist/playlistService";
import { fetchPlaylistInfo } from "../features/playlist/playlistService";

type CreatePlaylistActions = {
  hideCreatePlaylistModal: () => void;
  triggerError: (msg: string) => void;
  setSelectedTrack: (val: TrackObject | null) => void;
  setRefreshTrigger: (updater: (prev: number) => number) => void;
  closePlaylistSelectModal: () => void;
  showMessage: (msg: ActionType) => void;
  addTrackToPlaylist: (playlistId: string) => Promise<void>;
};

export async function handleCreatePlaylist(name: string, actions: CreatePlaylistActions): Promise<void> {
  const validationError = validatePlaylistName(name);

  if (validationError) {
    return actions.triggerError(validationError);
  }

  try {
    const { playlistId } = await createPlaylist(name);

    await actions.addTrackToPlaylist(playlistId);

    actions.setSelectedTrack(null);
    actions.setRefreshTrigger((prev) => prev + 1);
    actions.closePlaylistSelectModal();
    actions.hideCreatePlaylistModal();
    actions.showMessage("newPlaylist");
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
    const data = await fetchPlaylistInfo(currentPlaylistId);

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
