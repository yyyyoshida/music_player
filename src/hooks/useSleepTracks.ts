import { useEffect } from "react";
import usePlaylistStore from "../store/playlistStore";
import usePlaylistSelectionStore from "../store/playlistSelectionStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import useTrackMoreMenuStore from "../store/trackMoreMenuStore";
import type { ActionType } from "../types/actionType";
import { API } from "../api/apis";

const useSleepTracks = () => {
  const deleteTrack = usePlaylistStore((state) => state.deleteTrack);
  const selectedTrack = usePlaylistSelectionStore((state) => state.selectedTrack);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);
  const menuTrackId = useTrackMoreMenuStore((state) => state.menuTrackId);

  useEffect(() => {
    console.log(selectedTrack, "selectedTrack");
  }, [selectedTrack]);

  async function sleepTrack() {
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

  return { sleepTrack };
};

export default useSleepTracks;
