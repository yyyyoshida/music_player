import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { PlaylistContext } from "../../contexts/PlaylistContext";
import ActionSuccessMessageContext from "../../contexts/ActionSuccessMessageContext";
import useWaitForImagesLoad from "../../hooks/useWaitForImagesLoad";
import { useSkeletonHandler } from "../../hooks/useSkeletonHandler";
import usePlaybackStore from "../../store/playbackStore";
import usePlayerStore from "../../store/playerStore";
import TrackListHead from "../tracks/TrackListHead";
import TrackItem from "../tracks/TrackItem";
import RenamePlaylist from "./RenamePlaylist";
import DeletePlaylistModal from "./DeletePlaylistModal";
import TrackListSkeleton from "../skeletonUI/TrackListSkeleton";
import PlaylistCoverImageGrid from "./PlaylistCoverImageGrid";
import { getPlaylistInfo } from "../../utils/playlistUtils";
import { playIcon, FALLBACK_COVER_IMAGE } from "../../assets/icons";

const PlaylistDetail = ({ containerRef }) => {
  const { id } = useParams();

  const [isRenameVisible, setIsRenameVisible] = useState(false);

  const { formatTime, setIsTrackSet, setTrackOrigin } = usePlayerContext();
  const {
    showDeletePlaylistModal,
    deletePlaylist,
    tracks,
    setTracks,
    formatTimeHours,
    setCurrentPlaylistId,
    deletedTrackDuration,
    setDeletedTrackDuration,
    addedTrackDuration,
    setAddedTrackDuration,
    isCoverImageFading,
    playlistInfo,
    setPlaylistInfo,
  } = useContext(PlaylistContext);

  const { showMessage } = useContext(ActionSuccessMessageContext);

  const queue = usePlaybackStore((state) => state.queue);
  const setQueue = usePlaybackStore((state) => state.setQueue);
  const currentTrackId = usePlaybackStore((state) => state.currentTrackId);
  const setCurrentTrackId = usePlaybackStore((state) => state.setCurrentTrackId);
  const currentIndex = usePlaybackStore((state) => state.currentIndex);
  const setCurrentIndex = usePlaybackStore((state) => state.setCurrentIndex);
  const setCurrentPlayedAt = usePlaybackStore((state) => state.setCurrentPlayedAt);
  const playerTrack = usePlayerStore((state) => state.playerTrack);

  const LOADING_DELAY = 200;

  const isEmptyPlaylist = tracks.length === 0;
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const { imagesLoaded, isImageListEmpty } = useWaitForImagesLoad("trackList", tracks, [tracks], LOADING_DELAY);
  const showSkeleton = useSkeletonHandler({ isImageListEmpty, imagesLoaded });
  const playlistDetailRef = useRef(null);

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
        console.error(error);
        showMessage("fetchPlaylistInfoFailed");
      }
    })();
  }, [id]);

  useEffect(() => {
    const cachedTracks = localStorage.getItem(`playlistDetail:${id}Tracks`);

    if (cachedTracks) {
      setTracks(JSON.parse(cachedTracks));
      setQueue(JSON.parse(cachedTracks));
      return;
    }

    (async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/playlists/${id}/tracks`);

        if (!response.ok) throw new Error("Failed to fetch playlists");

        const data = await response.json();
        localStorage.setItem(`playlistDetail:${id}Tracks`, JSON.stringify(data));
        setTracks(data);
        setQueue(data);
      } catch {
        showMessage("fetchPlaylistDetailFailed");
      }
    })();
  }, [id]);

  useEffect(() => {
    const track = queue[currentIndex];
    if (!track) return;

    const addedAt = track.addedAt;
    const date = addedAt instanceof Date ? addedAt : new Date(addedAt);

    setCurrentPlayedAt(date.toLocaleString());
  }, [currentIndex]);

  function playFirstTrack() {
    const firstTrack = queue?.[0];
    if (!firstTrack?.trackUri && !firstTrack?.audioURL) {
      return showMessage("unselected");
    }

    const audioSrc = firstTrack.trackUri || firstTrack.audioURL;
    const trackSource = firstTrack.source;

    setIsTrackSet(true);
    setCurrentIndex(0);
    setCurrentTrackId(firstTrack.id);
    playerTrack(audioSrc, trackSource);
  }

  return (
    <div className="playlist-detail" ref={playlistDetailRef}>
      <div className="playlist-detail__header">
        <div className="playlist-detail__header-cover-img-wrapper">
          <PlaylistCoverImageGrid
            images={tracks.map((track) => track.albumImage)}
            wrapperClassName={`playlist-detail__header-cover-imgs ${showSkeleton || isEmptyPlaylist ? "" : isCoverImageFading ? "fade-out" : "fade-in"}`}
            fallbackImgWrapperClassName="header-cover-fallback-wrapper"
            fallbackImgClassName="playlist-cover-fallback"
          />

          <div className="playlist-detail__header-initial-cover-img-bg">
            <img src={FALLBACK_COVER_IMAGE} className=" playlist-initial-cover-img playlist-detail__header-initial-cover-img" />
          </div>
        </div>
        <div className={`playlist-detail__header-info fade-on-loaded ${showSkeleton ? "" : "fade-in"}`}>
          <h2 className="playlist-detail__header-title">{playlistInfo.name}</h2>

          <p className="playlist-detail__header-status">{`${tracks.length}曲, ${formatTimeHours(playlistInfo.totalDuration + addedTrackDuration - deletedTrackDuration)}`}</p>
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
      <>
        <ul className={`playlist-detail__list fade-on-loaded ${showSkeleton ? "" : "fade-in-up"}`}>
          {tracks.map((track, index) => {
            const addedAt = track.addedAt;
            const date = addedAt instanceof Date ? addedAt : new Date(addedAt);

            const isCurrentTrack = currentTrackId === track.id;
            const isClicked = isCurrentTrack;

            return (
              <TrackItem
                key={track?.addedAt?.seconds || index}
                track={track}
                index={index}
                isCurrentTrack={isCurrentTrack}
                isClicked={isClicked}
                date={date.toLocaleString()}
                formatTime={formatTime}
                parentRef={playlistDetailRef}
              />
            );
          })}
        </ul>
      </>

      <DeletePlaylistModal tracks={tracks} deletePlaylist={deletePlaylist} id={id} />
      <RenamePlaylist isRenameVisible={isRenameVisible} setIsRenameVisible={setIsRenameVisible} tracks={tracks} />
    </div>
  );
};

export default PlaylistDetail;
