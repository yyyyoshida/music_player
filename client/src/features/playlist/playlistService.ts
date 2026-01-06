import { API } from "../../api/apis";

export async function createPlaylist(name: string) {
  const response = await fetch(API.PLAYLISTS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) throw new Error(String(response.status));

  const data = await response.json().catch(() => null);

  if (!data) throw new Error("プレイリスト作成失敗");

  return data;
}

export async function deletePlaylist(playlistId: string) {
  const response = await fetch(API.playlist(playlistId), {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("プレイリスト削除失敗");
}

export async function fetchPlaylistInfo(id: string) {
  const response = await fetch(API.playlistInfo(id));

  if (!response.ok) throw new Error(String(response.status));

  const data = await response.json();

  if (!data) throw new Error("プレイリスト情報取得失敗");

  return data;
}
