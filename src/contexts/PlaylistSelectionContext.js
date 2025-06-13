import { createContext, useState, useRef, useContext, useEffect } from "react";
import { addDoc, collection, increment, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase";
import { ActionSuccessMessageContext } from "../contexts/ActionSuccessMessageContext";
import { PlaylistContext } from "../contexts/PlaylistContext";
import imageCompression from "browser-image-compression";
import { FALLBACK_COVER_IMAGE } from "../assets/icons";
import UploadModalContext from "./UploadModalContext";
import { usePlayerContext } from "../contexts/PlayerContext";

export const PlaylistSelectionContext = createContext();

export const PlaylistSelectionProvider = ({ children }) => {
  const [isSelectVisible, setIsSelectVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [localCoverImageUrl, setLocalCoverImageUrl] = useState(null);
  const [uploadTrackFile, setUploadTrackFile] = useState(null);

  const { showMessage } = useContext(ActionSuccessMessageContext);
  const { setPreselectedTrack } = useContext(PlaylistContext);
  const { showUploadModal, hideUploadModal } = useContext(UploadModalContext);
  const { trackOrigin } = usePlayerContext();

  const playlistNameRef = useRef("");

  // コンポーネントの関数と簡単な処理は可読性重視のためアロー関数で書く↓
  // それ以外はfunction宣言

  const toggleSelectVisible = () => setIsSelectVisible((prev) => !prev);

  const showSelectModal = () => setIsSelectVisible(true);

  const hideSelectPlaylistModal = () => setIsSelectVisible(false);

  // 音声ファイルをStorageにアップロード
  async function uploadAudio() {
    const audioRef = ref(storage, `tracks/${selectedTrack.title}_${Date.now()}.mp3`);
    await uploadBytes(audioRef, uploadTrackFile);
    const audioURL = await getDownloadURL(audioRef);
    const audioPath = audioRef.fullPath;

    return { audioURL, audioPath };
  }

  // 画像もあればアップロード
  async function uploadImage() {
    let albumImage = FALLBACK_COVER_IMAGE;
    let albumImagePath = null;

    if (localCoverImageUrl && localCoverImageUrl.startsWith("blob:")) {
      const response = await fetch(localCoverImageUrl);
      const blob = await response.blob();

      // 圧縮＆WebP変換
      const compressedBlob = await imageCompression(blob, {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 500,
        fileType: "image/webp",
        useWebWorker: true,
      });

      const imageRef = ref(storage, `covers/${selectedTrack.title}_${Date.now()}.webp`);
      await uploadBytes(imageRef, compressedBlob, {
        cacheControl: "public,max-age=86400",
      });
      albumImage = await getDownloadURL(imageRef);
      albumImagePath = imageRef.fullPath;
    }

    return { albumImage, albumImagePath };
  }
  //ローカル曲に画像がない場合の処理アップロード中のUIを適応させる ★
  // アップロード中で失敗したときの処理を追加する

  async function saveTrackToFirestore(playlistId) {
    await addDoc(collection(db, "playlists", playlistId, "tracks"), {
      ...selectedTrack,
      addedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "playlists", playlistId), {
      totalDuration: increment(selectedTrack.duration_ms),
    });
  }

  async function saveUploadedLocalTrack(playlistId) {
    await Promise.all([
      addDoc(collection(db, "playlists", playlistId, "tracks"), {
        title: selectedTrack.title,
        artist: selectedTrack.artist,
        duration_ms: selectedTrack.duration_ms,
        albumImage: selectedTrack.albumImage,
        albumImagePath: selectedTrack.albumImagePath,
        audioURL: selectedTrack.audioURL,
        audioPath: selectedTrack.audioPath,
        addedAt: serverTimestamp(),
        source: "local",
      }),
      updateDoc(doc(db, "playlists", playlistId), {
        totalDuration: increment(selectedTrack.duration_ms),
      }),
    ]);
  }

  async function saveUploadAndNewTrack(playlistId) {
    const [audioResult, imageResult] = await Promise.all([uploadAudio(), uploadImage()]);

    await Promise.all([
      addDoc(collection(db, "playlists", playlistId, "tracks"), {
        title: selectedTrack.title,
        artist: selectedTrack.artist,
        duration_ms: selectedTrack.duration_ms,
        albumImage: imageResult.albumImage,
        albumImagePath: imageResult.albumImagePath,
        audioURL: audioResult.audioURL,
        audioPath: audioResult.audioPath,
        addedAt: serverTimestamp(),
        source: "local",
      }),
      updateDoc(doc(db, "playlists", playlistId), {
        totalDuration: increment(selectedTrack.duration_ms),
      }),
    ]);
  }

  function afterTrackSaved() {
    console.timeEnd("アップロード");
    showMessage("add");
    hideSelectPlaylistModal();
    hideUploadModal();
  }

  async function executeTrackSave(actionFunction) {
    try {
      await actionFunction();
      afterTrackSaved();
    } catch (error) {
      console.error("曲追加失敗", error);
      hideUploadModal();
      hideSelectPlaylistModal();
      showMessage("addFailed");
    }
  }

  async function addTrackToPlaylist(playlistId) {
    console.log(selectedTrack);
    console.log("if文が通るか", selectedTrack.audioURL);
    console.time("アップロード");

    if (!selectedTrack) return;

    const isNewLocalTrack = selectedTrack.source === "local" && selectedTrack.audioURL === undefined;
    const isSpotifyTrack = selectedTrack.trackUri;
    const isUploadedLocalTrack = selectedTrack.audioURL;

    if (isNewLocalTrack) {
      hideSelectPlaylistModal();
      showUploadModal();
    }
    // elseを使わず、returnで区切ったほうが個人的に読みやすかったのだが、
    // それ以降の共通処理 catch()とかが実行されないので
    // try-catch関数でラップして共通処理を走らせるようにした ↓↓↓
    if (isSpotifyTrack) {
      await executeTrackSave(() => saveTrackToFirestore(playlistId));
      return;
    }

    if (isUploadedLocalTrack) {
      await executeTrackSave(() => saveUploadedLocalTrack(playlistId));
      return;
    }

    await executeTrackSave(() => saveUploadAndNewTrack(playlistId));
  }

  function handleTrackSelect(track, shouldToggle = true, file = null, imageUrl = null) {
    console.log(trackOrigin, "どこから北のこの曲handleTrackSelect");

    if (trackOrigin === "searchResults") {
      setSelectedTrack({
        trackId: track.id,
        trackUri: track.uri,
        albumImage: track.album.images[1]?.url,
        title: track.name,
        artist: track.artists[0]?.name,
        duration_ms: track.duration_ms,
        source: "spotify",
      });
    } else if (trackOrigin === "firebase" && track.source === "spotify") {
      setSelectedTrack({
        trackId: track.trackId,
        trackUri: track.trackUri,
        albumImage: track.albumImage,
        title: track.title,
        artist: track.artist,
        duration_ms: track.duration,
        source: "spotify",
      });
    } else if (trackOrigin === "local" || track.source === "local") {
      console.log(track);
      setSelectedTrack({
        title: track.title,
        artist: track.artist,
        duration_ms: track.duration_ms,
        albumImage: track.albumImage,
        albumImagePath: track.albumImagePath,
        audioPath: track.audioPath,
        audioURL: track.audioURL,
        source: "local",
      });
      if (file) setUploadTrackFile(file);
      if (imageUrl) setLocalCoverImageUrl(imageUrl);
    } else {
      setSelectedTrack({
        trackId: track.track.id,
        trackUri: track.track.uri,
        albumImage: track.track.album.images[1].url,
        title: track.track.name,
        artist: track.track.artists[0].name,
        duration: track.track.duration_ms,
        source: "spotify",
      });
    }

    if (shouldToggle) showSelectModal();
  }

  useEffect(() => {
    setPreselectedTrack(selectedTrack);
  }, [selectedTrack]);

  return (
    <PlaylistSelectionContext.Provider
      value={{
        toggleSelectVisible,
        isSelectVisible,
        setIsSelectVisible,
        playlistNameRef,
        addTrackToPlaylist,
        setSelectedTrack,
        handleTrackSelect,
      }}
    >
      {children}
    </PlaylistSelectionContext.Provider>
  );
};

export default PlaylistSelectionContext;
