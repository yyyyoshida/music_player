import { useEffect } from "react";
import { getPlaylistInfo } from "../utils/playlistUtils";
import usePlaylistStore from "../store/playlistStore";
import usePlaybackStore from "../store/playbackStore";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";

const usePlaylistDetail = (id, containerRef) => {
  const setCurrentPlaylistId = usePlaylistStore((state) => state.setCurrentPlaylistId);
  const setDeletedTrackDuration = usePlaylistStore((state) => state.setDeletedTrackDuration);
  const setAddedTrackDuration = usePlaylistStore((state) => state.setAddedTrackDuration);
  const setPlaylistInfo = usePlaylistStore((state) => state.setPlaylistInfo);
  const setTracks = usePlaylistStore((state) => state.setTracks);

  const setQueue = usePlaybackStore((state) => state.setQueue);
  const setTrackOrigin = usePlaybackStore((state) => state.setTrackOrigin);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  async function fetchTracks() {
    const cachedTracks = localStorage.getItem(`playlistDetail:${id}Tracks`);

    if (cachedTracks) {
      setTracks(JSON.parse(cachedTracks));
      setQueue(JSON.parse(cachedTracks));
      return;
    }

    const response = await fetch(`${BASE_URL}/api/playlists/${id}/tracks`);
    if (!response.ok) throw new Error("Failed to fetch playlists");

    const data = await response.json();
    localStorage.setItem(`playlistDetail:${id}Tracks`, JSON.stringify(data));
    setTracks(data);
    setQueue(data);
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
      try {
        const playlistInfoData = await getPlaylistInfo(id);
        setPlaylistInfo(playlistInfoData);
      } catch (error) {
        showMessage("fetchPlaylistInfoFailed");
      }

      try {
        await fetchTracks();
      } catch {
        showMessage("fetchPlaylistDetailFailed");
      }
    })();
  }, [id]);
};

export default usePlaylistDetail;
