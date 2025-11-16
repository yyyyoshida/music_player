import { create } from "zustand";
import usePlaylistStore from "./playlistStore";
import usePlaybackStore from "./playbackStore";
import useActionSuccessMessageStore from "./actionSuccessMessageStore";
import useUploadModalStore from "./uploadModalStore";
import { clearPlaylistCache } from "../utils/clearPlaylistCache";
import type { TrackObject, fromSearchResultTrackObject } from "../types/tracksType";
import type { ActionType } from "../types/actionType";
import { FALLBACK_COVER_IMAGE } from "../assets/icons";
import { API } from "../api/apis";

type PlaylistSelectStore = {
  isSelectVisible: boolean;
  selectedTrack: TrackObject | null;
  localCoverImageUrl: string | null;
  uploadTrackFile: File | null;

  setSelectedTrack: (selectedTrack: TrackObject) => void;
  setLocalCoverImageUrl: (localCoverImageUrl: string | null) => void;
  setUploadTrackFile: (uploadTrackFile: File | null) => void;

  openPlaylistSelectModal: () => void;
  closePlaylistSelectModal: () => void;
  addTrackToList: (playlistId: string, addedTrack: TrackObject) => void;
  saveTrackToFirestore: (playlistId: string) => Promise<void>;
  saveUploadedLocalTrack: (playlistId: string) => Promise<void>;
  blobUrlToFile: (blobUrl: string | null, filename: string) => Promise<File | null>;
  saveUploadAndNewTrack: (playlistId: string) => Promise<void>;
  executeTrackSave: (actionFunction: () => void, playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string) => Promise<void>;
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

  // executeTrackSave関数でtry-catchをラップしてるから不要↓
  saveTrackToFirestore: async (playlistId) => {
    const { addTrackToList, selectedTrack } = get();

    const response = await fetch(API.playlistSpotifyTracks(playlistId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedTrack),
    });

    if (!response.ok) throw new Error("addFailedSpotify");

    const { addedTrack } = await response.json();
    addTrackToList(playlistId, addedTrack);
  },

  saveUploadedLocalTrack: async (playlistId) => {
    const { addTrackToList, selectedTrack } = get();

    const response = await fetch(API.playlistLocalTracks(playlistId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedTrack),
    });

    if (!response.ok) throw new Error("addFailedLocal");

    const { addedTrack } = await response.json();
    addTrackToList(playlistId, addedTrack);
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

  saveUploadAndNewTrack: async (playlistId) => {
    const { blobUrlToFile, localCoverImageUrl, uploadTrackFile, selectedTrack, addTrackToList } = get();
    const formData = new FormData();

    const coverImageFile = await blobUrlToFile(localCoverImageUrl, "cover.webp");
    console.log(coverImageFile, "coverImageFile");

    if (!uploadTrackFile) {
      console.error("音声ファイルがありません");
      throw new Error("addFailedNewLocal");
    }
    if (!selectedTrack) {
      console.error("トラック情報がありません");
      throw new Error("addFailedNewLocal");
    }

    if (coverImageFile) formData.append("cover", coverImageFile);
    formData.append("audio", uploadTrackFile);
    formData.append("track", JSON.stringify(selectedTrack));

    const response = await fetch(API.playlistNewLocalTracks(playlistId), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("addFailedNewLocal");

    const { addedTrack } = await response.json();
    addTrackToList(playlistId, addedTrack);
  },

  executeTrackSave: async (actionFunction, playlistId) => {
    const { closePlaylistSelectModal } = get();
    const { fadeCoverImages } = usePlaylistStore.getState();
    const { showMessage } = useActionSuccessMessageStore.getState();
    const { hideUploadModal } = useUploadModalStore.getState();

    try {
      await actionFunction();
      fadeCoverImages();
      showMessage("add");
      closePlaylistSelectModal();
      hideUploadModal();
      clearPlaylistCache(playlistId);
    } catch (error: unknown) {
      console.error(error);
      hideUploadModal();
      closePlaylistSelectModal();
      // ※ saveUploadAndNewTrack などで throw されたエラーコード（例: "addFailedNewLocal"）を受け取る
      // ActionSuccessMessage.js 側でユーザー向けメッセージに変換して表示している ↙

      // 既知のエラー以外は汎用の "addFailed" を表示
      if (typeof error === "object" && error !== null && "message" in error) {
        const message = (error as { message: string }).message;

        showMessage(message as ActionType);
      } else {
        showMessage("addFailed");
      }
    }
  },

  addTrackToPlaylist: async (playlistId) => {
    const {
      selectedTrack,
      closePlaylistSelectModal,
      executeTrackSave,
      saveTrackToFirestore,
      saveUploadedLocalTrack,
      saveUploadAndNewTrack,
    } = get();
    const { showUploadModal } = useUploadModalStore.getState();

    if (!selectedTrack || !("source" in selectedTrack)) return;

    const isNewLocalTrack = selectedTrack.source === "local-upload" && !("audioURL" in selectedTrack);

    const isSpotifyTrack = "trackUri" in selectedTrack;
    const isUploadedLocalTrack = "audioURL" in selectedTrack;

    if (isNewLocalTrack) {
      closePlaylistSelectModal();
      showUploadModal();
    }
    // elseを使わず、returnで区切ったほうが個人的に読みやすかったのだが、
    // それ以降の共通処理 catch()とかが実行されないので
    // try-catch関数でラップして共通処理を走らせるようにした ↓↓↓

    if (isSpotifyTrack) {
      await executeTrackSave(() => saveTrackToFirestore(playlistId), playlistId);
      return;
    }

    if (isUploadedLocalTrack) {
      await executeTrackSave(() => saveUploadedLocalTrack(playlistId), playlistId);
      return;
    }

    await executeTrackSave(() => saveUploadAndNewTrack(playlistId), playlistId);
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
