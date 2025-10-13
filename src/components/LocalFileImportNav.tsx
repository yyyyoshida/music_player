import { useEffect, useState, useRef, type ChangeEvent } from "react";
// @ts-ignore
import jsmediatags from "jsmediatags/dist/jsmediatags.min.js";
import LocalAudioDuration from "./LocalAudioDuration";
import usePlaybackStore from "../store/playbackStore";
import usePlaylistSelectionStore from "../store/playlistSelectionStore";
import type { LocalTrack } from "../store/playbackStore";

type MediaTags = {
  title?: string;
  artist?: string;
  album?: string;
  picture?: {
    data: number[];
    format: string;
  };
};

const LocalFileImportNav = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localCoverImageUrl, setLocalCoverImageUrl] = useState<string | null>(null);
  const [uploadTrackFile, setUploadTrackFile] = useState<File | null>(null);
  const [trackDuration, setTrackDuration] = useState<number | null>(null);
  const [tags, setTags] = useState<MediaTags | null>(null);

  const handleTrackSelect = usePlaylistSelectionStore((state) => state.handleTrackSelect);
  const setTrackOrigin = usePlaybackStore((state) => state.setTrackOrigin);

  function handleClick() {
    setTrackOrigin("local");
    fileInputRef.current?.click();
  }

  // タグの中にある画像を取得
  function getMediaTags(file: File) {
    jsmediatags.read(file, {
      onSuccess: function (tag: any) {
        setTags(tag.tags);
        const picture = tag.tags.picture;

        if (picture) {
          const uint8Array = new Uint8Array(picture.data);
          const blob = new Blob([uint8Array], { type: picture.format });
          const imgSrc = URL.createObjectURL(blob);
          setLocalCoverImageUrl(imgSrc);
        } else {
          setLocalCoverImageUrl(null);
        }
      },
      onError: function (error: any) {
        console.log("タグ読み取り失敗:", error);
      },
    });
  }

  //
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      e.target.value = "";
      getMediaTags(file);
      setUploadTrackFile(file);
    }
  }

  // データベースに保存する情報の紐付け
  useEffect(() => {
    if (uploadTrackFile && tags && trackDuration !== null) {
      const localTrack: Partial<LocalTrack> = {
        title: tags.title || uploadTrackFile.name,
        artist: tags.artist || "Unknown Artist",
        duration_ms: trackDuration,
        albumImage: localCoverImageUrl || "/img/fallback-cover.png",
      };

      handleTrackSelect(localTrack as LocalTrack, true, uploadTrackFile, localCoverImageUrl);
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
