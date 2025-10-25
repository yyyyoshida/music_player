import { useEffect } from "react";
import usePlaylistStore from "../store/playlistStore";
import usePlaylistSelectionStore from "../store/playlistSelectionStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import useTrackMoreMenuStore from "../store/trackMoreMenuStore";
import usePlaybackStore from "../store/playbackStore";
import type { ActionType } from "../types/actionType";
import { API } from "../api/apis";
import { STORAGE_KEYS } from "../utils/storageKeys";

const useSleepTracks = () => {
  const deleteTrack = usePlaylistStore((state) => state.deleteTrack);
  const setTracks = usePlaylistStore((state) => state.setTracks);
  const setQueue = usePlaybackStore((state) => state.setQueue);
  const selectedTrack = usePlaylistSelectionStore((state) => state.selectedTrack);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);
  const menuTrackId = useTrackMoreMenuStore((state) => state.menuTrackId);

  useEffect(() => {
    console.log(selectedTrack, "selectedTrack");
  }, [selectedTrack]);

  async function sleepTrack() {
    const cached = localStorage.getItem(STORAGE_KEYS.SLEEP_TRACKS);
    const cachedTracks = cached ? JSON.parse(cached) : [];

    try {
      if (!selectedTrack) throw new Error("曲が選択されていません");
      if (!("source" in selectedTrack)) throw new Error("曲が壊れています");

      const isSpotifyTrack = selectedTrack.source === "spotify";

      let response = null;
      if (isSpotifyTrack) {
        response = await fetch(API.SLEEP_SPOTIFY_TRACKS, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedTrack),
        });
      } else {
        throw new Error("ローカル曲はまだ未対応");
      }

      if (!response.ok) throw new Error("sleepFailedSpotify");
      const { sleepingTrack } = await response.json();
      await deleteTrack(menuTrackId, false);

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
      const response = await fetch(API.SLEEP_SPOTIFY_TRACKS);
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

  return { sleepTrack, fetchSleepTracks };
};

export default useSleepTracks;
