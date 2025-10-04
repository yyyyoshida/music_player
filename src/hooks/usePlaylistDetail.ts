import { useEffect } from "react";
import { getPlaylistInfo } from "../utils/playlistUtils";
import usePlaylistStore from "../store/playlistStore";
import usePlaybackStore from "../store/playbackStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";

const usePlaylistDetail = (id: string, containerRef: React.RefObject<HTMLElement>): void => {
  const setCurrentPlaylistId = usePlaylistStore((state) => state.setCurrentPlaylistId);
  const setDeletedTrackDuration = usePlaylistStore((state) => state.setDeletedTrackDuration);
  const setAddedTrackDuration = usePlaylistStore((state) => state.setAddedTrackDuration);
  const setPlaylistInfo = usePlaylistStore((state) => state.setPlaylistInfo);
  const setTracks = usePlaylistStore((state) => state.setTracks);

  const setQueue = usePlaybackStore((state) => state.setQueue);
  const setTrackOrigin = usePlaybackStore((state) => state.setTrackOrigin);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  function fetchTracksFailed(logValue: unknown) {
    console.error(logValue as number | Error);
    setTracks([]);
    setQueue([]);
    showMessage("fetchPlaylistDetailFailed");
  }

  async function fetchTracks(): Promise<void> {
    const cachedTracks = localStorage.getItem(`playlistDetail:${id}Tracks`);

    if (cachedTracks) {
      setTracks(JSON.parse(cachedTracks));
      setQueue(JSON.parse(cachedTracks));
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/playlists/${id}/tracks`);

      if (!response.ok) {
        fetchTracksFailed(response.status);
        return;
      }

      const data = await response.json();
      localStorage.setItem(`playlistDetail:${id}Tracks`, JSON.stringify(data));
      setTracks(data);
      setQueue(data);
    } catch (error) {
      fetchTracksFailed(error);
    }
  }

  useEffect(() => {
    containerRef.current.scrollTo(0, 0);
    setDeletedTrackDuration(0);
    setAddedTrackDuration(0);
    setTrackOrigin("firebase");
    setCurrentPlaylistId(id);
  }, []);

  useEffect(() => {
    (async () => {
      await getPlaylistInfo(id, setPlaylistInfo, showMessage);

      await fetchTracks();
    })();
  }, [id]);
};

export default usePlaylistDetail;
