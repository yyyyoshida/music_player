import { useEffect } from "react";
import { getPlaylistInfo } from "../utils/playlistUtils";
import usePlaylistStore from "../store/playlistStore";
import usePlaybackStore from "../store/playbackStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import { API } from "../api/apis";

const usePlaylistDetail = (
  id: string | undefined,
  containerRef: React.RefObject<HTMLElement | null>
): void => {
  const setCurrentPlaylistId = usePlaylistStore((state) => state.setCurrentPlaylistId);
  const setDeletedTrackDuration = usePlaylistStore((state) => state.setDeletedTrackDuration);
  const setAddedTrackDuration = usePlaylistStore((state) => state.setAddedTrackDuration);
  const setPlaylistInfo = usePlaylistStore((state) => state.setPlaylistInfo);
  const setTracks = usePlaylistStore((state) => state.setTracks);

  const setQueue = usePlaybackStore((state) => state.setQueue);
  const setTrackOrigin = usePlaybackStore((state) => state.setTrackOrigin);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

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
      const response = await fetch(API.FETCH_PLAYLIST_TRACKS(id ?? ""));

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
