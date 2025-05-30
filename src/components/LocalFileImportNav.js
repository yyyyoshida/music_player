import { useEffect, useState, useContext, useRef } from "react";
import jsmediatags from "jsmediatags/dist/jsmediatags.min.js";
import LocalAudioDuration from "./LocalAudioDuration";
import { db } from "../firebase";
import { PlaylistSelectionContext } from "../contexts/PlaylistSelectionContext";

const LocalFileImportNav = () => {
  const fileInputRef = useRef(null);
  const [localCoverArtUrl, setLocalCoverArtUrl] = useState(null);
  const [uploadTrackFile, setUploadTrackFile] = useState(null);
  const [duration, setDuration] = useState(null);
  const [tags, setTags] = useState(null);
  const { handleTrackSelect } = useContext(PlaylistSelectionContext);

  function handleClick() {
    fileInputRef.current?.click();
  }

  function getMediaTags(file) {
    jsmediatags.read(file, {
      onSuccess: function (tag) {
        // console.log("タグ情報:", tag.tags);
        // console.log("タイトル", tag.tags.title);
        // console.log("アーティスト", tag.tags.artist);
        // console.log(tag.tags.picture);
        setTags(tag.tags);
        const picture = tag.tags.picture;

        if (picture) {
          const uint8Array = new Uint8Array(picture.data);
          const blob = new Blob([uint8Array], { type: picture.format });
          const imgSrc = URL.createObjectURL(blob);
          console.log(imgSrc);
          setLocalCoverArtUrl(imgSrc);
        }
      },
      onError: function (error) {
        console.log("タグ読み取り失敗:", error);
      },
    });
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      getMediaTags(file);
      setUploadTrackFile(file);
      console.log("選択されたファイル:", file);
    }
  }

  useEffect(() => {
    if (uploadTrackFile && tags && duration !== null) {
      const localTrack = {
        track: {
          id: null,
          uri: null,
          name: tags.title || uploadTrackFile.name,
          artists: [{ name: tags.artist || "Unknown Artist" }],
          duration_ms: duration * 1000,
          album: {
            images: [
              {},
              { url: localCoverArtUrl || "/default-cover.png" }, // デフォルトカバー画像用意しとくと安心
              {},
            ],
          },
        },
      };

      handleTrackSelect(localTrack, "local");
      console.log("ローカルトラック情報", localTrack);
    }
  }, [uploadTrackFile, tags, duration, localCoverArtUrl, handleTrackSelect]);

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
            console.log("曲の長さ（秒）:", d);
            setDuration(d);
          }}
        />
      )}
    </>
  );
};

export default LocalFileImportNav;
