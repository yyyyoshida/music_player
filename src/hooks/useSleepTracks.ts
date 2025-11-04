import { useEffect } from "react";
import usePlaylistStore from "../store/playlistStore";
import usePlaylistSelectionStore from "../store/playlistSelectionStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import usePlaybackStore from "../store/playbackStore";
import type { ActionType } from "../types/actionType";
import type { SpotifyTrack, LocalTrack } from "../types/tracksType";
import { API } from "../api/apis";
import { STORAGE_KEYS } from "../utils/storageKeys";
import { updatePlaylistsCacheFromSleep } from "../utils/playlistCache";

type MatchedTrack = {
  trackId: string;
  playlistId: string;
};

const useSleepTracks = () => {
  const deleteTrack = usePlaylistStore((state) => state.deleteTrack);
  const setTracks = usePlaylistStore((state) => state.setTracks);
  const setQueue = usePlaybackStore((state) => state.setQueue);
  const selectedTrack = usePlaylistSelectionStore((state) => state.selectedTrack);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

  useEffect(() => {
    console.log(selectedTrack, "selectedTrack");
  }, [selectedTrack]);

  async function sleepTrack() {
    const cached = localStorage.getItem(STORAGE_KEYS.SLEEP_TRACKS);
    const cachedTracks = cached ? JSON.parse(cached) : [];

    try {
      if (!selectedTrack) throw new Error("曲が選択されていません");

      const response = await fetch(API.SLEEP_TRACKS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedTrack),
      });

      if (!response.ok) throw new Error("sleepFailedSpotify");
      const { sleepingTrack, matchedTracks } = await response.json();

      matchedTracks.forEach(async (track: MatchedTrack) => {
        await deleteTrack(track.trackId, false, track.playlistId);
      });

      cachedTracks.push(sleepingTrack);
      localStorage.setItem(STORAGE_KEYS.SLEEP_TRACKS, JSON.stringify(cachedTracks));

      console.log(sleepingTrack);
      showMessage("sleep");
    } catch (error) {
      console.error(error, selectedTrack);
      if (error instanceof Error) {
        showMessage(error.message as ActionType);
      } else {
        showMessage("sleepFailed");
      }
    }
  }

  async function fetchSleepTracks() {
    const cached = localStorage.getItem(STORAGE_KEYS.SLEEP_TRACKS);
    const cachedTracks = cached ? JSON.parse(cached) : null;

    if (cachedTracks) {
      console.log("キャッシュで取得");
      setTracks(cachedTracks);
      setQueue(cachedTracks);
      return;
    }

    try {
      const response = await fetch(API.SLEEP_TRACKS);
      if (!response.ok) throw new Error(response.statusText);

      const fetchedTracks = await response.json();

      setTracks(fetchedTracks);
      setQueue(fetchedTracks);
      localStorage.setItem(STORAGE_KEYS.SLEEP_TRACKS, JSON.stringify(fetchedTracks));
    } catch (error) {
      console.error("スリープ曲一覧の取得に失敗:", error);
      showMessage("sleepTracksFetchFailed");
    }
  }

  async function restoreSleepTrack(trackId: string | undefined, playlistIds: string[]) {
    let removedTrack = null;
    const cached = localStorage.getItem(STORAGE_KEYS.SLEEP_TRACKS);
    const cachedTracks: (SpotifyTrack | LocalTrack)[] = JSON.parse(cached!);

    try {
      if (!trackId) throw new Error("trackIdが無効");
      if (!playlistIds || playlistIds.length === 0) throw new Error("playlistIdsが無効");

      const response = await fetch(API.deleteSleepSpotifyTracks(trackId), { method: "DELETE" });
      if (!response.ok) throw new Error(response.statusText);

      removedTrack = await response.json();

      const updateTracks = cachedTracks.filter((track) => track.id !== trackId);
      setTracks(updateTracks);
      setQueue(updateTracks);
      localStorage.setItem(STORAGE_KEYS.SLEEP_TRACKS, JSON.stringify(updateTracks));
    } catch (error) {
      console.error("スリープ曲の復元に失敗:", error);
      showMessage("sleepSpotifyRestoreFailed");
      return;
    }

    try {
      const response = await fetch(API.RESTORE_SLEEP_SPOTIFY_TRACKS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(removedTrack),
      });

      if (!response.ok) throw new Error(response.statusText);

      const data = await response.json();
      const restoredTracks = data.restoredTracks;
      const updatedPlaylistsInfo = data.updatedPlaylists;

      for (let i = 0; i < restoredTracks.length; i++) {
        const restoredTrack = restoredTracks[i];
        const playlistId = updatedPlaylistsInfo[i].playlistId;
        const playlistTotalDuration = updatedPlaylistsInfo[i].totalDuration;

        updatedPlaylistCache(playlistId, restoredTrack);
        updatePlaylistInfoCache(playlistId, playlistTotalDuration);
        updatePlaylistsCacheFromSleep(playlistId, restoredTrack);
      }

      showMessage("sleepTrackRestore");
    } catch (error) {
      console.error("スリープ曲の復元に失敗:", error);
      showMessage("sleepSpotifyRestoreFailed");
    }
  }

  return { sleepTrack, fetchSleepTracks, restoreSleepTrack };
};

export default useSleepTracks;

function updatedPlaylistCache(playlistId: string, restoredTrack: SpotifyTrack) {
  const cached = localStorage.getItem(STORAGE_KEYS.getCachedTracksKey(playlistId));

  if (cached) {
    const cachedTracks = JSON.parse(cached);
    cachedTracks.push(restoredTrack);

    localStorage.setItem(STORAGE_KEYS.getCachedTracksKey(playlistId), JSON.stringify(cachedTracks));
  }
}

function updatePlaylistInfoCache(playlistId: string, totalDuration: number) {
  const cached = localStorage.getItem(STORAGE_KEYS.getCachedPlaylistInfoKey(playlistId));

  if (cached) {
    const cachedInfo = JSON.parse(cached);
    cachedInfo.totalDuration = totalDuration;

    localStorage.setItem(STORAGE_KEYS.getCachedPlaylistInfoKey(playlistId), JSON.stringify(cachedInfo));
  }
}
