import { API } from "../../api/apis";
import type { TrackObject } from "../../types/tracksType";

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

// =======================
// 曲をプレイリストに追加
// =======================
export async function addSpotifyTrack(playlistId: string, track: TrackObject): Promise<TrackObject> {
  const response = await fetch(API.playlistSpotifyTracks(playlistId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(track),
  });

  if (!response.ok) throw new Error("addFailedSpotify");

  const { addedTrack } = await response.json();
  return addedTrack;
}

export async function addLocalTrack(playlistId: string, track: TrackObject): Promise<TrackObject> {
  const response = await fetch(API.playlistLocalTracks(playlistId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(track),
  });

  if (!response.ok) {
    throw new Error("addFailedLocal");
  }

  const { addedTrack } = await response.json();
  return addedTrack;
}

export async function addNewLocalTrack(playlistId: string, formData: FormData): Promise<TrackObject> {
  const response = await fetch(API.playlistNewLocalTracks(playlistId), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("addFailedNewLocal");
  }

  const { addedTrack } = await response.json();
  return addedTrack;
}
