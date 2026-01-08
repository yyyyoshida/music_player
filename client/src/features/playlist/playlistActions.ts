import type { ActionType } from "../../types/actionType";
import validatePlaylistName from "../../utils/validatePlaylistName";
import { getPlaylistInfoCache, setPlaylistInfoCache, clearPlaylistInfoCache, clearPlaylistCache } from "./playlistCache";
import { createPlaylist, deletePlaylist, addSpotifyTrack, addLocalTrack, addNewLocalTrack } from "./playlistService";
import { fetchPlaylistInfo } from "./playlistService";
import usePlaylistSelectionStore from "../../store/playlistSelectionStore";
import usePlaylistStore from "../../store/playlistStore";
import useActionSuccessMessageStore from "../../store/actionSuccessMessageStore";
import useUploadModalStore from "../../store/uploadModalStore";

// ====================
// 新規プレイリスト作成
// ====================
export async function handleCreatePlaylist(name: string): Promise<void> {
  const { hideCreatePlaylistModal, triggerError, setRefreshTrigger } = usePlaylistStore.getState();
  const { closePlaylistSelectModal, setSelectedTrack } = usePlaylistSelectionStore.getState();
  const showMessage = useActionSuccessMessageStore.getState().showMessage;
  const validationError = validatePlaylistName(name);

  if (validationError) {
    return triggerError(validationError);
  }

  try {
    const { playlistId } = await createPlaylist(name);

    await handleAddTrackToPlaylist(playlistId);

    setSelectedTrack(null);
    setRefreshTrigger((prev) => prev + 1);
    closePlaylistSelectModal();
    showMessage("newPlaylist");
  } catch {
    showMessage("newPlaylistFailed");
  } finally {
    hideCreatePlaylistModal();
  }
}

// =================
// プレイリスト削除
// =================
export async function handleDeletePlaylist(playlistId: string, navigate: (url: string) => void): Promise<void> {
  const showMessage = useActionSuccessMessageStore.getState().showMessage;
  const hideDeletePlaylistModal = usePlaylistStore.getState().hideDeletePlaylistModal;

  try {
    await deletePlaylist(playlistId);

    clearPlaylistCache(playlistId);
    navigate("/playlist");
    showMessage("deletePlaylist");
  } catch (error) {
    showMessage("deletePlaylistFailed");
    console.error(error);
  } finally {
    hideDeletePlaylistModal();
  }
}

// ====================
// プレイリスト詳細取得
// ====================
export async function getPlaylistInfo(
  currentPlaylistId: string,
  setPlaylistInfo: (info: { name: string; totalDuration: number }) => void,
  showMessage: (key: ActionType) => void
): Promise<{ name: string; totalDuration: number }> {
  const cached = getPlaylistInfoCache(currentPlaylistId);

  if (cached) {
    setPlaylistInfo(cached);
    return cached;
  }

  try {
    const data = await fetchPlaylistInfo(currentPlaylistId);

    setPlaylistInfoCache(currentPlaylistId, data);
    setPlaylistInfo(data);
    return data;
  } catch (error) {
    getPlaylistInfoFailed(error);
    return { name: "プレイリスト", totalDuration: 0 };
  }

  function getPlaylistInfoFailed(logValue: any) {
    console.error("プレイリストメタ情報取得失敗: ", logValue);
    clearPlaylistInfoCache(currentPlaylistId);
    showMessage("fetchPlaylistInfoFailed");
    setPlaylistInfo({ name: "プレイリスト", totalDuration: 0 });
  }
}
// =======================
// プレイリストに曲を追加
// =======================
export async function handleAddTrackToPlaylist(playlistId: string): Promise<void> {
  const { selectedTrack, closePlaylistSelectModal } = usePlaylistSelectionStore.getState();
  const showUploadModal = useUploadModalStore.getState().showUploadModal;
  const showMessage = useActionSuccessMessageStore.getState().showMessage;
  const hideUploadModal = useUploadModalStore.getState().hideUploadModal;

  if (!selectedTrack || !("source" in selectedTrack)) return;

  const isSpotifyTrack = "trackUri" in selectedTrack;
  const isLocalTrack = "audioURL" in selectedTrack;
  const isNewLocalTrack = selectedTrack.source === "local-upload" && !("audioURL" in selectedTrack);

  try {
    if (isSpotifyTrack) {
      await addSpotifyTrackToPlaylist(playlistId);
      await afterTrackAdded(playlistId);
      return;
    }

    if (isLocalTrack) {
      await addLocalTrackToPlaylist(playlistId);
      await afterTrackAdded(playlistId);
      return;
    }

    if (isNewLocalTrack) {
      showUploadModal();
      await addNewLocalTrackToPlaylist(playlistId);
      await afterTrackAdded(playlistId);
    }
  } catch (error: unknown) {
    console.error(error);

    hideUploadModal();
    closePlaylistSelectModal();

    if (typeof error === "object" && error !== null && "message" in error) {
      const message = (error as { message: string }).message;

      showMessage(message as ActionType);
    } else {
      showMessage("addFailed");
    }
  }
}

// ==============================
// プレイリストにSpotify曲を追加
// ==============================
async function addSpotifyTrackToPlaylist(playlistId: string) {
  const { addTrackToList, selectedTrack } = usePlaylistSelectionStore.getState();
  if (!selectedTrack) throw new Error("selectedTrackが存在しない");

  const addedTrack = await addSpotifyTrack(playlistId, selectedTrack);
  addTrackToList(playlistId, addedTrack);
}

// =====================================
// プレイリストに既存のローカル曲を追加
// =====================================
async function addLocalTrackToPlaylist(playlistId: string) {
  const { addTrackToList, selectedTrack } = usePlaylistSelectionStore.getState();
  if (!selectedTrack) throw new Error("selectedTrackが存在しない");

  const addedTrack = await addLocalTrack(playlistId, selectedTrack);
  addTrackToList(playlistId, addedTrack);
}

// ===================================
// プレイリストに新規ローカル曲を追加
// ===================================
async function addNewLocalTrackToPlaylist(playlistId: string) {
  const { blobUrlToFile, localCoverImageUrl, uploadTrackFile, selectedTrack, addTrackToList } = usePlaylistSelectionStore.getState();
  const formData = new FormData();

  const coverImageFile = await blobUrlToFile(localCoverImageUrl, "cover.webp");

  if (!uploadTrackFile) {
    console.error("音声ファイルがありません");
    throw new Error("addFailedNewLocal");
  }
  if (!selectedTrack) {
    console.error("トラック情報がありません");
    throw new Error("addFailedNewLocal");
  }

  if (coverImageFile) formData.append("cover", coverImageFile);
  formData.append("audio", uploadTrackFile);
  formData.append("track", JSON.stringify(selectedTrack));

  const addedTrack = await addNewLocalTrack(playlistId, formData);
  addTrackToList(playlistId, addedTrack);
}

// =============================
// プレイリストに曲追加後の処理
// =============================
async function afterTrackAdded(playlistId: string): Promise<void> {
  const closePlaylistSelectModal = usePlaylistSelectionStore.getState().closePlaylistSelectModal;
  const fadeCoverImages = usePlaylistStore.getState().fadeCoverImages;
  const showMessage = useActionSuccessMessageStore.getState().showMessage;
  const hideUploadModal = useUploadModalStore.getState().hideUploadModal;

  fadeCoverImages();
  showMessage("add");
  closePlaylistSelectModal();
  hideUploadModal();
  clearPlaylistCache(playlistId);
}
