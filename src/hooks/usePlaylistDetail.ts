import { useEffect } from "react";
import { getPlaylistInfo } from "../utils/playlistUtils";
import usePlaylistStore from "../store/playlistStore";
import usePlaybackStore from "../store/playbackStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import { API } from "../api/apis";
import { STORAGE_KEYS } from "../utils/storageKeys";

const usePlaylistDetail = (
  id: string | undefined,
  containerRef: React.RefObject<HTMLElement | null>
): void => {
  const { setCurrentPlaylistId, setDeletedTrackDuration, setAddedTrackDuration, setPlaylistInfo, setTracks } =
    usePlaylistStore.getState();

  const { setQueue, setTrackOrigin } = usePlaybackStore.getState();
  const showMessage = useActionSuccessMessageStore.getState().showMessage;

  function fetchTracksFailed(logValue: unknown) {
    console.error(logValue as number | Error);
    setTracks([]);
    setQueue([]);
    showMessage("fetchPlaylistDetailFailed");
  }

  async function fetchTracks(): Promise<void> {
    if (!id) {
      fetchTracksFailed(400);
      return;
    }
    const cachedTracks = localStorage.getItem(STORAGE_KEYS.getCachedTracksKey(id));

    if (cachedTracks) {
      setTracks(JSON.parse(cachedTracks));
      setQueue(JSON.parse(cachedTracks));
      return;
    }

    try {
      const response = await fetch(API.fetchPlaylistTracks(id));

      if (!response.ok) {
        fetchTracksFailed(response.status);
        return;
      }

      const data = await response.json();
      localStorage.setItem(STORAGE_KEYS.getCachedTracksKey(id), JSON.stringify(data));
      setTracks(data);
      setQueue(data);
    } catch (error) {
      fetchTracksFailed(error);
    }
  }

  useEffect(() => {
    if (!id) return;
    containerRef.current?.scrollTo(0, 0);
    setDeletedTrackDuration(0);
    setAddedTrackDuration(0);
    setTrackOrigin("firebase");
    setCurrentPlaylistId(id);
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      await getPlaylistInfo(id, setPlaylistInfo, showMessage);

      await fetchTracks();
    })();
  }, [id]);
};

export default usePlaylistDetail;
