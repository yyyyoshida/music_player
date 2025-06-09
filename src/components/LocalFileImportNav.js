import { useEffect, useState, useContext, useRef } from "react";
import jsmediatags from "jsmediatags/dist/jsmediatags.min.js";
import LocalAudioDuration from "./LocalAudioDuration";
import { PlaylistSelectionContext } from "../contexts/PlaylistSelectionContext";
import { usePlayerContext } from "../contexts/PlayerContext";

const LocalFileImportNav = () => {
  const fileInputRef = useRef(null);

  const [localCoverImageUrl, setLocalCoverImageUrl] = useState(null);
  const [uploadTrackFile, setUploadTrackFile] = useState(null);
  const [trackDuration, setTrackDuration] = useState(null);
  const [tags, setTags] = useState(null);

  const { handleTrackSelect } = useContext(PlaylistSelectionContext);
  const { setTrackOrigin } = usePlayerContext();

  function handleClick() {
    setTrackOrigin("local");
    fileInputRef.current?.click();
  }

  // タグの中にある画像を取得
  function getMediaTags(file) {
    jsmediatags.read(file, {
      onSuccess: function (tag) {
        setTags(tag.tags);
        const picture = tag.tags.picture;

        if (picture) {
          const uint8Array = new Uint8Array(picture.data);
          const blob = new Blob([uint8Array], { type: picture.format });
          const imgSrc = URL.createObjectURL(blob);
          console.log(imgSrc);
          setLocalCoverImageUrl(imgSrc);
        }
      },
      onError: function (error) {
        console.log("タグ読み取り失敗:", error);
      },
    });
  }

  //
  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      event.target.value = "";
      getMediaTags(file);
      setUploadTrackFile(file);
      console.log("選択されたファイル:", file);
    }
  }

  // データベースに保存する情報の紐付け
  useEffect(() => {
    if (uploadTrackFile && tags && trackDuration !== null) {
      console.log(uploadTrackFile);
      const localTrack = {
        title: tags.title || uploadTrackFile.name,
        artist: tags.artist || "Unknown Artist",
        duration_ms: trackDuration,
        imageURL: localCoverImageUrl || "/img/デフォルト画像.png",
      };

      handleTrackSelect(localTrack, true, uploadTrackFile, localCoverImageUrl);
      console.log("ローカルトラック情報", localTrack);
    }
  }, [uploadTrackFile, tags, trackDuration, localCoverImageUrl]);

  return (
    <>
      <li className="sidebar-header__item">
        <button className="sidebar-header__link" onClick={handleClick}>
          <img src="/img/upload-icon.png" alt="" className="sidebar-header__item-icon" width="16" height="16" />
          PCから曲を読み込む
        </button>

        <input type="file" accept="audio/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: "none" }} />
      </li>
      {uploadTrackFile && (
        <LocalAudioDuration
          file={uploadTrackFile}
          onDuration={(d) => {
            setTrackDuration(Math.round(d * 1000));
          }}
        />
      )}
    </>
  );
};

export default LocalFileImportNav;
