import { createContext, useState, useRef, useContext, useEffect } from "react";
import { addDoc, collection, increment, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, storageRef } from "firebase/storage";
import { db, storage } from "../firebase";
import { ActionSuccessMessageContext } from "../contexts/ActionSuccessMessageContext";
import { PlaylistContext } from "../contexts/PlaylistContext";
import imageCompression from "browser-image-compression";
import { FALLBACK_COVER_IMAGE } from "../assets/icons";

export const PlaylistSelectionContext = createContext();

export const PlaylistSelectionProvider = ({ children }) => {
  const [isSelectVisible, setIsSelectVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [localCoverImageUrl, setLocalCoverImageUrl] = useState(null);
  const [uploadTrackFile, setUploadTrackFile] = useState(null);

  const { showMessage } = useContext(ActionSuccessMessageContext);
  const { setPreselectedTrack } = useContext(PlaylistContext);

  const playlistNameRef = useRef("");

  function toggleSelectVisible() {
    setIsSelectVisible((prev) => !prev);
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
    if (!selectedTrack) return;

    try {
      if (selectedTrack.trackUri) {
        await saveTrackToFirestore(playlistId);
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

      showMessage("add");
      toggleSelectVisible();
    } catch (error) {
      console.error(" 曲追加失敗", error);
      console.log(selectedTrack);
    }
  }

  function handleTrackSelect(track, type, shouldToggle = true, file = null, imageUrl = null) {
    if (type === "searchResults") {
      setSelectedTrack({
        trackId: track.id,
        trackUri: track.uri,
        albumImage: track.album.images[1]?.url,
        title: track.name,
        artist: track.artists[0]?.name,
        duration: track.duration_ms,
        source: "spotify",
      });
    } else if (type === "firebase") {
      setSelectedTrack({
        trackId: track.trackId,
        trackUri: track.trackUri,
        albumImage: track.albumImage,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        source: "spotify",
      });
    } else if (type === "local") {
      setSelectedTrack({
        title: track.title,
        artist: track.artist,
        duration: track.duration_ms,
        albumImage: track.image,
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

    if (shouldToggle) toggleSelectVisible();
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
