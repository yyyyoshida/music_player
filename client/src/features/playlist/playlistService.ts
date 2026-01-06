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
