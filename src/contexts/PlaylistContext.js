import { createContext, useState } from "react";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import usePlaylistStore from "../store/playlistStore";
import { clearPlaylistsCache } from "../utils/clearPlaylistCache";
import { getPlaylistInfo } from "../utils/playlistUtils";

export const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
  const [tracks, setTracks] = useState([]);
  // const setTracks = usePlaylistStore((state) => state.setTracks);
  const currentPlaylistId = usePlaylistStore((state) => state.currentPlaylistId);
  const setDeletedTrackDuration = usePlaylistStore((state) => state.setDeletedTrackDuration);
  const setIsCoverImageFading = usePlaylistStore((state) => state.setIsCoverImageFading);
  const playlistNameRef = usePlaylistStore((state) => state.playlistNameRef);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const MAX_NAME_LENGTH = 10;

  const fadeCoverImages = () => setIsCoverImageFading(true);

  async function deleteTrack(trackId) {
    try {
      const playlistInfoData = await getPlaylistInfo(currentPlaylistId);
      const totalDuration = playlistInfoData.totalDuration;

      const response = await fetch(`${BASE_URL}/api/playlists/${currentPlaylistId}/tracks/${trackId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("楽曲削除失敗");

      const { deletedTrack } = await response.json();

      setDeletedTrackDuration((prev) => {
        const deletedTrackDuration = prev + deletedTrack.duration_ms;
        const resultTotalDuration = totalDuration - deletedTrackDuration;

        const updatedInfoData = { ...playlistInfoData, totalDuration: resultTotalDuration };
        localStorage.setItem(`playlistDetail:${currentPlaylistId}Info`, JSON.stringify(updatedInfoData));

        return deletedTrackDuration;
      });

      setTracks((prevTracks) => {
        const updatedTracks = prevTracks.filter((track) => track.id !== trackId);
        localStorage.setItem(`playlistDetail:${currentPlaylistId}Tracks`, JSON.stringify(updatedTracks));
        return updatedTracks;
      });

      fadeCoverImages();
      showMessage("deleteTrack");
      clearPlaylistsCache();
    } catch {
      showMessage("deleteTrackFailed");
    }
  }

  return (
    <PlaylistContext.Provider
      value={{
        playlistNameRef,
        deleteTrack,
        tracks,
        setTracks,

        MAX_NAME_LENGTH,

        fadeCoverImages,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export default PlaylistContext;
