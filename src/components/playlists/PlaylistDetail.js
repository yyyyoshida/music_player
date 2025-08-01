import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { playIcon, FALLBACK_COVER_IMAGE } from "../../assets/icons";
import TrackListHead from "../tracks/TrackListHead";
import { usePlayerContext } from "../../contexts/PlayerContext";
import TrackItem from "../tracks/TrackItem";
import { PlaylistContext } from "../../contexts/PlaylistContext";
import { PlaybackContext } from "../../contexts/PlaybackContext";
import RenamePlaylist from "./RenamePlaylist";
import DeletePlaylistModal from "./DeletePlaylistModal";
import ActionSuccessMessageContext from "../../contexts/ActionSuccessMessageContext";
import TrackListSkeleton from "../skeletonUI/TrackListSkeleton";
import useWaitForImagesLoad from "../../hooks/useWaitForImagesLoad";
import PlaylistCoverImageGrid from "./PlaylistCoverImageGrid";
import { useSkeletonHandler } from "../../hooks/useSkeletonHandler";

const PlaylistDetail = ({ containerRef }) => {
  const { id } = useParams();

  const [isRenameVisible, setIsRenameVisible] = useState(false);

  const [playlistInfo, setPlaylistInfo] = useState({ duration: 0 });

  const { playerTrack, formatTime, isPlaying, trackId, setIsTrackSet, setTrackOrigin } = usePlayerContext();
  const {
    showDeletePlaylistModal,
    deletePlaylist,
    tracks,
    setTracks,
    formatTimeHours,
    setPlaylistId,
    playlistName,
    deletedTrackDuration,
    setDeletedTrackDuration,
    addedTrackDuration,
    setAddedTrackDuration,
    isCoverImageFading,
  } = useContext(PlaylistContext);
  const {
    setCurrentTrackId,
    currentTrackId,
    setQueue,
    queue,
    updateCurrentIndex,
    currentPlayedAt,
    setCurrentPlayedAt,
    currentIndex,
    setCurrentIndex,
  } = useContext(PlaybackContext);
  const { showMessage } = useContext(ActionSuccessMessageContext);

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
    setPlaylistId(id);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/playlists/${id}/info`);

        if (!response.ok) throw new Error("Failed to fetch playlists");

        const data = await response.json();
        setPlaylistInfo(data);
        console.log(data);
      } catch {
        showMessage("fetchPlaylistInfoFailed");
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/playlists/${id}/tracks`);

        if (!response.ok) throw new Error("Failed to fetch playlists");

        const data = await response.json();
        console.log(data, "👌PlaylistDetailのdata");
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
          <h2 className="playlist-detail__header-title">{playlistName}</h2>

          <p className="playlist-detail__header-status">{`${tracks.length}曲, ${formatTimeHours(playlistInfo.totalDuration + addedTrackDuration - deletedTrackDuration)}`}</p>
        </div>

        <div className="playlist-detail__header-actions-buttons">
          <button
            className="playlist-detail__header-play-button playlist-detail__header-button"
            onClick={() => {
              if (!queue?.[0]?.trackUri) {
                showMessage("unselected");
                return;
              }
              setIsTrackSet(true);
              updateCurrentIndex(0);
              setCurrentTrackId(queue[0].id);
              playerTrack(queue[0].trackUri);
              setCurrentIndex(0);
            }}
          >
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

            const isTrackPlaying = isCurrentTrack && isPlaying;
            const isClicked = isCurrentTrack;

            return (
              <TrackItem
                key={track?.addedAt?.seconds || index}
                track={track}
                index={index}
                isCurrentTrack={isCurrentTrack}
                isTrackPlaying={isTrackPlaying}
                isClicked={isClicked}
                playerTrack={playerTrack}
                formatTime={formatTime}
                addedAt={track.addedAt}
                date={date.toLocaleString()}
                currentPlayedAt={currentPlayedAt}
                setCurrentPlayedAt={setCurrentPlayedAt}
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
