import { create } from "zustand";
import usePlaylistStore from "./playlistStore";
import usePlaybackStore from "./playbackStore";
import type { TrackObject, fromSearchResultTrackObject } from "../types/tracksType";
import { FALLBACK_COVER_IMAGE } from "../assets/icons";

type PlaylistSelectStore = {
  isSelectVisible: boolean;
  selectedTrack: TrackObject | null;
  localCoverImageUrl: string | null;
  uploadTrackFile: File | null;

  setSelectedTrack: (selectedTrack: TrackObject | null) => void;
  setLocalCoverImageUrl: (localCoverImageUrl: string | null) => void;
  setUploadTrackFile: (uploadTrackFile: File | null) => void;

  openPlaylistSelectModal: () => void;
  closePlaylistSelectModal: () => void;
  addTrackToList: (playlistId: string, addedTrack: TrackObject) => void;
  blobUrlToFile: (blobUrl: string | null, filename: string) => Promise<File | null>;
  handleTrackSelect: (
    track: TrackObject | fromSearchResultTrackObject,
    type: "search" | "playlist" | "local-upload",
    shouldToggle: boolean,
    file?: File | null,
    imageUrl?: string | null
  ) => void;
};

const usePlaylistSelectionStore = create<PlaylistSelectStore>((set, get) => ({
  isSelectVisible: false,
  selectedTrack: null,
  localCoverImageUrl: null,
  uploadTrackFile: null,

  setSelectedTrack: (selectedTrack) => set({ selectedTrack }),
  setLocalCoverImageUrl: (localCoverImageUrl) => set({ localCoverImageUrl }),
  setUploadTrackFile: (uploadTrackFile) => set({ uploadTrackFile }),

  openPlaylistSelectModal: () => set({ isSelectVisible: true }),
  closePlaylistSelectModal: () => set({ isSelectVisible: false }),

  addTrackToList: (playlistId, addedTrack) => {
    const { currentPlaylistId, setTracks, setAddedTrackDuration } = usePlaylistStore.getState();
    const { setQueue } = usePlaybackStore.getState();

    if (currentPlaylistId !== playlistId) return;

    setTracks((prev) => [...prev, addedTrack]);
    setQueue((prev) => [...prev, addedTrack]);
    setAddedTrackDuration((prev) => prev + addedTrack.duration_ms);
  },

  blobUrlToFile: async (blobUrl, filename) => {
    try {
      if (!blobUrl) throw new Error("Blob URLが無効");

      const response = await fetch(blobUrl);
      if (!response.ok) {
        console.error("Blob取得失敗: ", response.status);
        return null;
      }
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch {
      return null;
    }
  },

  handleTrackSelect: (track, type, shouldToggle = true, file = null, imageUrl = null) => {
    const { setSelectedTrack, setUploadTrackFile, setLocalCoverImageUrl, openPlaylistSelectModal } = get();

    const isSearchResultTrack = type === "search" && "uri" in track;
    const isSpotifyTrack = type === "playlist" && "source" in track && track.source === "spotify";
    const isUploadTrack = type === "local-upload" && "source" in track && track.source === "local-upload";
    const isLocalTrack = type === "playlist" && "source" in track && track.source === "local";

    if (isSearchResultTrack) {
      setSelectedTrack({
        trackId: track.id,
        trackUri: track.uri,
        albumImage: track.album!.images[1]?.url ?? FALLBACK_COVER_IMAGE,
        title: track.name,
        artist: track.artists[0]?.name ?? "Unknown Artist",
        duration_ms: track.duration_ms,
        source: "spotify",
      });
    } else if (isSpotifyTrack) {
      setSelectedTrack({
        trackId: track.trackId,
        trackUri: track.trackUri,
        albumImage: track.albumImage,
        title: track.title,
        artist: track.artist,
        duration_ms: track.duration_ms,
        source: "spotify",
      });
    } else if (isUploadTrack) {
      setSelectedTrack({
        title: track.title,
        artist: track.artist,
        duration_ms: track.duration_ms,
        albumImage: track.albumImage,
        source: "local-upload",
      });
      if (file) setUploadTrackFile(file);
      if (imageUrl) setLocalCoverImageUrl(imageUrl);
    } else if (isLocalTrack) {
      setSelectedTrack({
        trackId: track.trackId,
        title: track.title,
        artist: track.artist,
        duration_ms: track.duration_ms,
        albumImage: track.albumImage,
        albumImagePath: track.albumImagePath,
        audioPath: track.audioPath,
        audioURL: track.audioURL,
        source: "local",
      });
    }
    // }else
    // 最近再生した曲は現在機能してないので一時的にコメントアウト{
    // setSelectedTrack({
    //   trackId: track.track.id,
    //   trackUri: track.track.uri,
    //   albumImage: track.track.album.images[1].url,
    //   title: track.track.name,
    //   artist: track.track.artists[0].name,
    //   duration: track.track.duration_ms,
    //   source: "spotify",
    // });
    // }

    if (shouldToggle) openPlaylistSelectModal();
  },
}));

export default usePlaylistSelectionStore;
