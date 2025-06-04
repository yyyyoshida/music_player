import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { collection, getDocs, getDoc, doc, query, orderBy } from "firebase/firestore";
import { playIcon } from "../../assets/icons";
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

const PlaylistDetail = ({ containerRef }) => {
  const { id } = useParams();

  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [playlistInfo, setPlaylistInfo] = useState({ duration: 0 });

  const { playerTrack, formatTime, isPlaying, trackId, setIsTrackSet } = usePlayerContext();

  const {
    deletePlaylist,
    tracks,
    setTracks,
    formatTimeHours,
    setPlaylistId,

    playlistName,

    deletedTrackDuration,
    setDeletedTrackDuration,

    isCoverImageFading,
  } = useContext(PlaylistContext);

  const { setCurrentTrackId, currentTrackId, setQueue, queue, playTrackAt, currentPlayedAt, setCurrentPlayedAt, currentIndex, setCurrentIndex } =
    useContext(PlaybackContext);

  const { showMessage } = useContext(ActionSuccessMessageContext);

  const coverImagesRef = useRef();

  const [initialLoaded, setInitialLoaded] = useState(false);

  const imagesLoaded = useWaitForImagesLoad("trackList", tracks, [tracks], 100);

  useEffect(() => {
    containerRef.current.scrollTo(0, 0);
    setDeletedTrackDuration(0);
  }, []);

  useEffect(() => {
    console.log("initialLoaded", initialLoaded);
  }, [initialLoaded]);

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
          id: doc.id, // ← ここでFirestoreのドキュメントIDもゲット
          ...doc.data(), // ← トラックの中身
        }));
        setTracks(trackList);
      } catch (error) {
        console.error("曲の取得に失敗した", error);
      }
    };

    fetchTracks();
  }, [id]);

  useEffect(() => {
    console.log("queuequeuequeue", queue);
  }, [queue]);

  function toggleDeleteVisible() {
    setIsDeleteVisible((prev) => !prev);
  }

  useEffect(() => {
    const track = queue[currentIndex];
    console.log("hakkkaaaaaaaaaaaaa");
    // 順に再生ボタンが機能しない問題
    if (!track) return;

    console.log(track);

    const timestamp = track.addedAt;
    const date = timestamp.toDate();
    setCurrentPlayedAt(date.toLocaleString());
  }, [currentIndex]);

  useEffect(() => {
    setQueue(tracks);
    // setIsTrackSet(true);
  }, [tracks]);

  useEffect(() => {
    if (imagesLoaded) {
      setInitialLoaded(true);
    }
  }, [imagesLoaded]);

  return (
    <div className="playlist-detail">
      <div className="playlist-detail__header">
        <div className="playlist-detail__header-cover-img-wrapper">
          <div
            className={`playlist-detail__header-cover-imgs ${tracks.length <= 3 ? "single" : ""} ${!initialLoaded ? "" : isCoverImageFading ? "fade-out" : "fade-in"}`}
            ref={coverImagesRef}
          >
            {[...tracks].slice(0, tracks.length <= 3 ? 1 : 4).map((track, i) => (
              <img key={i} src={track.albumImage} alt={`track-${i}`} className={`playlist-detail__header-cover-img img-${i}`} width="99" height="99" />
            ))}
          </div>

          <div className="playlist-detail__header-initial-cover-img-bg">
            <img src="/img/playlist-icon1.png" className="playlists-detail__header-initial-cover-img playlist-initial-cover-img" />
          </div>
        </div>
        <div className="playlist-detail__header-info">
          <h2 className={`playlist-detail__header-title fade-on-loaded ${!initialLoaded ? "" : "fade-in"}`}>{playlistName}</h2>

          <p
            className={`playlist-detail__header-status fade-on-loaded ${!initialLoaded ? "" : "fade-in"}`}
          >{`${tracks.length}曲, ${formatTimeHours(playlistInfo.totalDuration - deletedTrackDuration)}`}</p>
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
              playTrackAt(0);
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

      {!initialLoaded && <TrackListSkeleton count={8} />}

      <ul className={`playlist-detail__list fade-on-loaded ${!initialLoaded ? "" : "fade-in-up"} `}>
        {tracks.map((track, index) => {
          const timestamp = track.addedAt;
          const date = timestamp.toDate();

          // const isCurrentTrack = currentPlayedAt === date.toLocaleString();
          // const isCurrentTrack = currentPlayedAt === date.getTime();
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
              type={"firebase"}
              addedAt={track.addedAt}
              date={date.toLocaleString()}
              currentPlayedAt={currentPlayedAt}
              setCurrentPlayedAt={setCurrentPlayedAt}
            />
          );
        })}
      </ul>

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
