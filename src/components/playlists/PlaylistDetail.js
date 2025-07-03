import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { collection, getDocs, getDoc, doc, query, orderBy } from "firebase/firestore";
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
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [playlistInfo, setPlaylistInfo] = useState({ duration: 0 });

  const { playerTrack, formatTime, isPlaying, trackId, setIsTrackSet, setTrackOrigin } = usePlayerContext();
  const { deletePlaylist, tracks, setTracks, formatTimeHours, setPlaylistId, playlistName, deletedTrackDuration, setDeletedTrackDuration, isCoverImageFading } =
    useContext(PlaylistContext);
  const { setCurrentTrackId, currentTrackId, setQueue, queue, updateCurrentIndex, currentPlayedAt, setCurrentPlayedAt, currentIndex, setCurrentIndex } =
    useContext(PlaybackContext);
  const { showMessage } = useContext(ActionSuccessMessageContext);

  const LOADING_DELAY = 200;

  const isEmptyPlaylist = tracks.length === 0;

  const { imagesLoaded, isImageListEmpty } = useWaitForImagesLoad("trackList", tracks, [tracks], LOADING_DELAY);
  const showSkeleton = useSkeletonHandler({ isImageListEmpty, imagesLoaded });

  useEffect(() => {
    containerRef.current.scrollTo(0, 0);
    setDeletedTrackDuration(0);
    setTrackOrigin("firebase");
  }, []);

  useEffect(() => {
    const fetchPlaylistInfo = async () => {
      try {
        const docRef = doc(db, "playlists", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPlaylistInfo(docSnap.data());
        }
      } catch (error) {
        console.error("プレイリスト情報の取得に失敗", error);
      }
    };

    setPlaylistId(id);

    fetchPlaylistInfo();
  }, [id]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const tracksRef = collection(db, "playlists", id, "tracks");
        const q = query(tracksRef, orderBy("addedAt"));
        const trackSnapshot = await getDocs(q);
        const trackList = trackSnapshot.docs.map((doc) => ({
          id: doc.id, // ← ここでFirestoreのドキュメントIDも取得
          ...doc.data(), // ← トラックの中身
        }));
        setTracks(trackList);
        setQueue(trackList);
      } catch (error) {
        console.error("曲の取得に失敗した", error);
      }
    };

    fetchTracks();
  }, [id]);

  function toggleDeleteVisible() {
    setIsDeleteVisible((prev) => !prev);
  }

  useEffect(() => {
    const track = queue[currentIndex];
    if (!track) return;

    console.log(track);

    const timestamp = track.addedAt;
    const date = timestamp.toDate();
    setCurrentPlayedAt(date.toLocaleString());
  }, [currentIndex]);

  return (
    <div className="playlist-detail">
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

          <p className="playlist-detail__header-status">{`${tracks.length}曲, ${formatTimeHours(playlistInfo.totalDuration - deletedTrackDuration)}`}</p>
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
          <button className="playlist-detail__header-delete-button playlist-detail__header-button" onClick={toggleDeleteVisible}>
            <img src="/img/delete.png" className="playlist-detail__header-delete-button-icon playlist-detail__header-button-icon" />
            削除
          </button>
        </div>
      </div>

      <TrackListHead />

      <div className="playlist-detail__empty-message-wrapper empty-message-wrapper">
        <p className={`playlist-detail__empty-message fade-on-loaded ${showSkeleton || !isEmptyPlaylist ? "" : "fade-in-up"}`}>まだ何も保存されていません</p>
      </div>
      {showSkeleton && <TrackListSkeleton count={8} />}
      <>
        <ul className={`playlist-detail__list fade-on-loaded ${showSkeleton ? "" : "fade-in-up"}`}>
          {tracks.map((track, index) => {
            const timestamp = track.addedAt;
            const date = timestamp.toDate();

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
              />
            );
          })}
        </ul>
      </>

      <DeletePlaylistModal
        isDeleteVisible={isDeleteVisible}
        toggleDeleteVisible={toggleDeleteVisible}
        tracks={tracks}
        deletePlaylist={deletePlaylist}
        id={id}
      />
      <RenamePlaylist isRenameVisible={isRenameVisible} setIsRenameVisible={setIsRenameVisible} tracks={tracks} />
    </div>
  );
};

export default PlaylistDetail;
