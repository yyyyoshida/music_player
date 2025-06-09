import { createContext, useState, useRef, useContext, useEffect } from "react";
import { addDoc, collection, increment, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, storageRef } from "firebase/storage";
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

  function toggleSelectVisible() {
    setIsSelectVisible((prev) => !prev);
  }

  function showSelectModal() {
    setIsSelectVisible(true);
  }

  function hideSelectModal() {
    setIsSelectVisible(false);
  }

  async function saveTrackToFirestore(playlistId) {
    await addDoc(collection(db, "playlists", playlistId, "tracks"), {
      ...selectedTrack,
      addedAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "playlists", playlistId), {
      totalDuration: increment(selectedTrack.duration),
    });
  }

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
    let imageURL = FALLBACK_COVER_IMAGE;
    let imagePath = null;

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
      imageURL = await getDownloadURL(imageRef);
      imagePath = imageRef.fullPath;
    }

    return { imageURL, imagePath };
  }

  async function addTrackToPlaylist(playlistId) {
    console.log(selectedTrack);
    console.log("if文が通るか", selectedTrack.audioURL);
    console.time("アップロード");

    if (!selectedTrack) return;
    console.log(selectedTrack);
    console.log("if文が通るか", selectedTrack.audioURL);

    if (selectedTrack.source === "local" && selectedTrack.audioURL === false) {
      hideSelectModal();
      showUploadModal();
    }

    try {
      if (selectedTrack.trackUri) {
        await saveTrackToFirestore(playlistId);
      } else if (selectedTrack.audioURL) {
        await Promise.all([
          addDoc(collection(db, "playlists", playlistId, "tracks"), {
            title: selectedTrack.title,
            artist: selectedTrack.artist,
            duration: selectedTrack.duration,
            albumImage: selectedTrack.imageURL,
            imagePath: selectedTrack.imagePath,
            audioURL: selectedTrack.audioURL,
            audioPath: selectedTrack.audioPath,
            addedAt: serverTimestamp(),
            source: "local",
          }),

          updateDoc(doc(db, "playlists", playlistId), {
            totalDuration: increment(selectedTrack.duration),
          }),
        ]);
      } else {
        const [audioResult, imageResult] = await Promise.all([uploadAudio(), uploadImage()]);

        await Promise.all([
          addDoc(collection(db, "playlists", playlistId, "tracks"), {
            title: selectedTrack.title,
            artist: selectedTrack.artist,
            duration: selectedTrack.duration,
            albumImage: imageResult.imageURL,
            imagePath: imageResult.imagePath,
            audioURL: audioResult.audioURL,
            audioPath: audioResult.audioPath,
            addedAt: serverTimestamp(),
            source: "local",
          }),

          updateDoc(doc(db, "playlists", playlistId), {
            totalDuration: increment(selectedTrack.duration),
          }),
        ]);
      }

      console.timeEnd("アップロード");
      showMessage("add");
      // toggleSelectVisible();
      hideSelectModal();
      hideUploadModal();
    } catch (error) {
      console.error(" 曲追加失敗", error);
      console.log(selectedTrack);
    }
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
        duration: track.duration_ms,
        source: "spotify",
      });
    } else if (trackOrigin === "firebase" && track.source === "spotify") {
      setSelectedTrack({
        trackId: track.trackId,
        trackUri: track.trackUri,
        albumImage: track.albumImage,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        source: "spotify",
      });
    } else if (trackOrigin === "local" || track.source === "local") {
      console.log(track);
      setSelectedTrack({
        title: track.title,
        artist: track.artist,
        duration: track.duration_ms || track.duration,
        imageURL: track.albumImage,
        audioPath: track.audioPath,
        audioURL: track.audioURL,
        imagePath: track.imagePath,
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
