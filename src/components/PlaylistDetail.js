import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, getDoc, doc, query, orderBy } from "firebase/firestore";
import { playIcon } from "../assets/icons";
import TrackListHead from "./TrackListHead";
import { usePlayerContext } from "./PlayerContext";
import TrackItem from "./TrackItem";
import { PlaylistContext } from "./PlaylistContext";
import { PlaybackContext } from "../contexts/PlaybackContext";
import RenamePlaylist from "./RenamePlaylist";
import DeletePlaylistModal from "./DeletePlaylistModal";
import ActionSuccessMessageContext from "../contexts/ActionSuccessMessageContext";
import TrackListSkeleton from "./TrackListSkeleton";

const PlaylistDetail = () => {
  const { id } = useParams();

  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [playlistInfo, setPlaylistInfo] = useState({ name: "", duration: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const { playerTrack, formatTime, isStreaming, trackId, setIsTrackSet } = usePlayerContext();

  const { deletePlaylist, tracks, setTracks, formatTimeHours, playlistName, setPlaylistId } = useContext(PlaylistContext);
  const { setQueue, queue, playTrackAt } = useContext(PlaybackContext);

  const { showMessage } = useContext(ActionSuccessMessageContext);

  const coverImagesRef = useRef();

  function startLoading() {
    setIsLoading(true);
  }

  function stopLoading() {
    setIsLoading(false);
  }

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
      startLoading();
      try {
        const tracksRef = collection(db, "playlists", id, "tracks");
        const q = query(tracksRef, orderBy("addedAt"));
        const trackSnapshot = await getDocs(q);
        const trackList = trackSnapshot.docs.map((doc) => ({
          id: doc.id, // ← ここでFirestoreのドキュメントIDもゲット
          ...doc.data(), // ← トラックの中身
        }));
        setTracks(trackList);

        setTimeout(() => {
          stopLoading();
        }, 400);
      } catch (error) {
        console.error("曲の取得に失敗した", error);
      }
      // } finally {
      //   stopLoading();
      // }
    };

    fetchTracks();
  }, [id]);

  useEffect(() => {
    setQueue(tracks);
    // setIsTrackSet(true);
  }, [tracks]);

  useEffect(() => {
    console.log(queue);
  }, [queue]);

  function toggleDeleteVisible() {
    setIsDeleteVisible((prev) => !prev);
  }

  useEffect(() => {
    // if (!coverImagesRef) return;
    const transitionElement = coverImagesRef.current;
    if (!transitionElement) return;
    transitionElement.style.opacity = 0;
    function handleTransitionEnd() {
      transitionElement.style.opacity = 1;
    }

    const timeoutId = setTimeout(() => {
      transitionElement.style.opacity = 1;
      transitionElement.addEventListener("transitionend", handleTransitionEnd);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      transitionElement.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [tracks, isLoading]);

  return (
    <div className="playlist-detail">
      <div className="playlist-detail__header">
        <div className="playlist-detail__header-cover-img-wrapper">
          {!isLoading && (
            <div className={`playlist-detail__header-cover-imgs ${tracks.length <= 3 ? "single" : ""}`} ref={coverImagesRef}>
              {[...tracks].slice(0, tracks.length <= 3 ? 1 : 4).map((track, i) => (
                <img key={i} src={track.albumImage} alt={`track-${i}`} className={`playlist-detail__header-cover-img img-${i}`} />
              ))}
            </div>
          )}
          <div className="playlist-detail__header-initial-cover-img-bg">
            <img src="/img/playlist-icon1.png" className="playlists-detail__header-initial-cover-img playlist-initial-cover-img" />
          </div>
        </div>
        <div className="playlist-detail__header-info">
          <h2 className={`playlist-detail__header-title fade-on-loaded ${isLoading ? "" : "fade-in"}`}>{playlistInfo.name}</h2>

          <p
            className={`playlist-detail__header-status fade-on-loaded ${isLoading ? "" : "fade-in"}`}
          >{`${tracks.length}曲, ${formatTimeHours(playlistInfo.totalDuration)}`}</p>
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
              playerTrack(queue[0].trackUri);
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

      {isLoading && <TrackListSkeleton count={8} />}
      <ul className={`playlist-detail__list fade-on-loaded ${isLoading ? "" : "fade-in"}`}>
        {tracks.map((track, index) => {
          const isCurrentTrack = trackId === track.trackId;
          const isTrackPlaying = isCurrentTrack && isStreaming;
          const isClicked = isCurrentTrack;

          return (
            <TrackItem
              // key={track.trackId}
              key={track.addedAt?.seconds}
              track={track}
              index={index}
              isCurrentTrack={isCurrentTrack}
              isTrackPlaying={isTrackPlaying}
              isClicked={isClicked}
              // setIsTrackSet={setIsTrackSet}
              playerTrack={playerTrack}
              formatTime={formatTime}
              type={"firebase"}
              // playlistId={id}
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
