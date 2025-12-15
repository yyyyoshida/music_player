import { useEffect, useState } from "react";
import { getPlaylistInfo } from "../utils/playlistUtils";
import usePlaylistStore from "../store/playlistStore";
import usePlaybackStore from "../store/playbackStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import { API } from "../api/apis";
import { STORAGE_KEYS } from "../utils/storageKeys";

const usePlaylistDetail = (id: string | undefined, containerRef: React.RefObject<HTMLElement | null>) => {
  const tracks = usePlaylistStore((state) => state.tracks);
  const { setCurrentPlaylistId, setDeletedTrackDuration, setAddedTrackDuration, setPlaylistInfo, setTracks } =
    usePlaylistStore.getState();
  const [isPlaylistLoading, setIsPlaylistLoading] = useState(true);
  const [isPlaylistFromCache, setIsPlaylistFromCache] = useState(false);

  const { setQueue, setTrackOrigin } = usePlaybackStore.getState();
  const showMessage = useActionSuccessMessageStore.getState().showMessage;

  function fetchTracksFailed(logValue: unknown) {
    console.error(logValue as number | Error);
    setTracks([]);
    setQueue([]);
    showMessage("fetchPlaylistDetailFailed");
  }

  async function fetchTracks(): Promise<void> {
    setIsPlaylistLoading(true);
    if (!id) {
      fetchTracksFailed(400);
      return;
    }
    const cachedTracks = localStorage.getItem(STORAGE_KEYS.getCachedTracksKey(id));

    if (cachedTracks) {
      setTracks(JSON.parse(cachedTracks));
      setQueue(JSON.parse(cachedTracks));
      setIsPlaylistLoading(false);
      setIsPlaylistFromCache(true);
      return;
    }

    try {
      const response = await fetch(API.fetchPlaylistTracks(id));

      if (!response.ok) {
        fetchTracksFailed(response.status);
        return;
      }

      let data = await response.json();
      localStorage.setItem(STORAGE_KEYS.getCachedTracksKey(id), JSON.stringify(data));
      setTracks(data);
      setQueue(data);
    } catch (error) {
      fetchTracksFailed(error);
    } finally {
      setIsPlaylistLoading(false);
      setIsPlaylistFromCache(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    containerRef.current?.scrollTo(0, 0);
    setDeletedTrackDuration(0);
    setAddedTrackDuration(0);
    setTrackOrigin("firebase");
    setCurrentPlaylistId(id);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      await getPlaylistInfo(id, setPlaylistInfo, showMessage);

      await fetchTracks();
    })();
  }, [id]);

  return { tracks, isPlaylistLoading, isPlaylistFromCache };
};

export default usePlaylistDetail;
