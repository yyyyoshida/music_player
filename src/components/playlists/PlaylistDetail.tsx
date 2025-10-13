import { useState, useRef, type RefObject } from "react";
import { useParams } from "react-router-dom";
import usePlaylistDetail from "../../hooks/usePlaylistDetail";
import useWaitForImagesLoad from "../../hooks/useWaitForImagesLoad";
import { useSkeletonHandler } from "../../hooks/useSkeletonHandler";
import usePlaybackStore from "../../store/playbackStore";
import usePlayerStore from "../../store/playerStore";
import usePlaylistStore from "../../store/playlistStore";
import useActionSuccessMessageStore from "../../store/actionSuccessMessageStore";
import TrackListHead from "../tracks/TrackListHead";
import TrackItem from "../tracks/TrackItem";
import RenamePlaylist from "./RenamePlaylist";
import DeletePlaylistModal from "./DeletePlaylistModal";
import TrackListSkeleton from "../skeletonUI/TrackListSkeleton";
import PlaylistCoverImageGrid from "./PlaylistCoverImageGrid";
import { formatTimeHours } from "../../utils/formatTime";
import { playIcon, FALLBACK_COVER_IMAGE } from "../../assets/icons";
import type { SpotifyTrack, LocalTrack } from "../../store/playbackStore";

type PlaylistDetailProps = {
  containerRef: RefObject<HTMLDivElement>;
};

const PlaylistDetail = ({ containerRef }: PlaylistDetailProps) => {
  const { id } = useParams();
  const [isRenameVisible, setIsRenameVisible] = useState(false);

  const tracks = usePlaylistStore((state) => state.tracks);
  const deletedTrackDuration = usePlaylistStore((state) => state.deletedTrackDuration);
  const addedTrackDuration = usePlaylistStore((state) => state.addedTrackDuration);
  const isCoverImageFading = usePlaylistStore((state) => state.isCoverImageFading);
  const playlistInfo = usePlaylistStore((state) => state.playlistInfo);
  const showDeletePlaylistModal = usePlaylistStore((state) => state.showDeletePlaylistModal);

  const queue = usePlaybackStore((state) => state.queue);
  const playTrackAtIndex = usePlaybackStore((state) => state.playTrackAtIndex);

  const setIsTrackSet = usePlayerStore((state) => state.setIsTrackSet);
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

  const LOADING_DELAY = 200;
  const isEmptyPlaylist = tracks.length === 0;
  const { imagesLoaded, isImageListEmpty } = useWaitForImagesLoad("trackList", tracks, [tracks], LOADING_DELAY);
  const showSkeleton = useSkeletonHandler({ isImageListEmpty, imagesLoaded });
  usePlaylistDetail(id, containerRef);
  const playlistDetailRef = useRef(null);

  function playFirstTrack() {
    const firstTrack = queue?.[0];
    if (!firstTrack) return showMessage("unselected");

    const hasTrackUri = "trackUri" in firstTrack;
    const hasAudioURL = "audioURL" in firstTrack;

    if (!hasTrackUri && !hasAudioURL) {
      return showMessage("unselected");
    }

    setIsTrackSet(true);
    playTrackAtIndex(0);
  }

  return (
    <>
      {id ? (
        <div className="playlist-detail" ref={playlistDetailRef}>
          <div className="playlist-detail__header">
            <div className="playlist-detail__header-cover-img-wrapper">
              <PlaylistCoverImageGrid
                images={(tracks as (SpotifyTrack | LocalTrack)[]).map((track) => track.albumImage)}
                wrapperClassName={`playlist-detail__header-cover-imgs ${showSkeleton || isEmptyPlaylist ? "" : isCoverImageFading ? "fade-out" : "fade-in"}`}
                fallbackImgWrapperClassName="header-cover-fallback-wrapper"
                fallbackImgClassName="playlist-cover-fallback"
              />

              <div className="playlist-detail__header-initial-cover-img-bg">
                <img src={FALLBACK_COVER_IMAGE} className=" playlist-initial-cover-img playlist-detail__header-initial-cover-img" />
              </div>
            </div>
            <div className={`playlist-detail__header-info fade-on-loaded ${showSkeleton ? "" : "fade-in"}`}>
              <h2 className="playlist-detail__header-title">{playlistInfo?.name}</h2>

              <p className="playlist-detail__header-status">{`${tracks.length}曲, ${formatTimeHours(playlistInfo?.totalDuration + addedTrackDuration - deletedTrackDuration)}`}</p>
            </div>

            <div className="playlist-detail__header-actions-buttons">
              <button className="playlist-detail__header-play-button playlist-detail__header-button" onClick={playFirstTrack}>
                <img src={playIcon} className="playlist-detail__header-play-button-icon playlist-detail__header-button-icon" />
                順に再生
              </button>

              <button
                className="playlist-detail__header-rename-button playlist-detail__header-button"
                onClick={() => {
                  setIsRenameVisible((prev) => !prev);
                }}
              >
                <img src="/img/rename.png" className="playlist-detail__header-rename-button-icon playlist-detail__header-button-icon" />
                名前を変更
              </button>

              <button className="playlist-detail__header-delete-button playlist-detail__header-button" onClick={showDeletePlaylistModal}>
                <img src="/img/delete.png" className="playlist-detail__header-delete-button-icon playlist-detail__header-button-icon" />
                削除
              </button>
            </div>
          </div>

          <TrackListHead />

          <div className="playlist-detail__empty-message-wrapper empty-message-wrapper">
            <p className={`playlist-detail__empty-message fade-on-loaded ${showSkeleton || !isEmptyPlaylist ? "" : "fade-in-up"}`}>
              まだ何も保存されていません
            </p>
          </div>
          {showSkeleton && <TrackListSkeleton count={8} />}
          <ul className={`playlist-detail__list fade-on-loaded ${showSkeleton ? "" : "fade-in-up"}`}>
            {(tracks as (SpotifyTrack | LocalTrack)[]).map((track, index) => {
              const addedAt = track.addedAt;
              const date = new Date(addedAt ?? 0);

              return (
                <TrackItem key={track?.addedAt || index} track={track} index={index} date={date.toLocaleString()} parentRef={playlistDetailRef} />
              );
            })}
          </ul>

          <DeletePlaylistModal tracks={tracks as (SpotifyTrack | LocalTrack)[]} id={id} />

          <RenamePlaylist
            isRenameVisible={isRenameVisible}
            setIsRenameVisible={setIsRenameVisible}
            tracks={tracks as (SpotifyTrack | LocalTrack)[]}
          />
        </div>
      ) : (
        <div>プレイリストが見つかりません</div>
      )}
    </>
  );
};

export default PlaylistDetail;
