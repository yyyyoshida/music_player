import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, getDoc, doc, query, orderBy } from "firebase/firestore";
import { playIcon } from "../assets/icons";
import TrackListHead from "./TrackListHead";
import { usePlayerContext } from "./PlayerContext";
import { SearchContext } from "./SearchContext";
import TrackItem from "./TrackItem";
import { PlaylistContext } from "./PlaylistContext";
import { PlaybackContext } from "../contexts/PlaybackContext";
import RenamePlaylist from "./RenamePlaylist";
import DeletePlaylistModal from "./DeletePlaylistModal";

const PlaylistDetail = () => {
  const { id } = useParams();

  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [playlistInfo, setPlaylistInfo] = useState({ title: "", duration: 0 });

  const { playerTrack, formatTime, isStreaming, trackId } = usePlayerContext();

  const { setIsTrackSet } = useContext(SearchContext);
  const { deletePlaylist, tracks, setTracks, formatTimeHours, playlistName, setPlaylistId } = useContext(PlaylistContext);
  const { setQueue, queue, playTrackAt } = useContext(PlaybackContext);

  const isFirstRender = useRef([]);

  const initialCoverRef = useRef();

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
    setQueue(tracks);
    setIsTrackSet(true);
  }, [tracks]);

  function toggleDeleteVisible() {
    setIsDeleteVisible((prev) => !prev);
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (tracks.length === 0) return;

    const transitionElement = initialCoverRef.current;

    transitionElement.style.opacity = 1;
    function handleTransitionEnd() {
      transitionElement.style.opacity = 0;
    }

    setTimeout(() => {
      transitionElement.style.opacity = 0;
      transitionElement.addEventListener("transitionend", handleTransitionEnd);
    }, 200);
  }, [tracks]);

  return (
    <div className="playlist-detail">
      <div className="playlist-detail__header">
        <div className={`playlist-detail__header-cover-img-wrapper ${tracks.length <= 3 ? "single" : ""}`}>
          {[...tracks].slice(0, tracks.length <= 3 ? 1 : 4).map((track, i) => (
            <img key={i} src={track.albumImage} alt={`track-${i}`} className={`playlist-detail__header-cover-img img-${i}`} />
          ))}
          <div className="playlist-detail__header-initial-cover-img-bg" ref={initialCoverRef}>
            <img src="/img/playlist-icon1.png" className="playlists-detail__header-initial-cover-img playlist-initial-cover-img" />
          </div>
        </div>
        <div className="playlist-detail__header-info">
          <h2 className="playlist-detail__header-title">{playlistName}</h2>

          <p className="playlist-detail__header-status"> {`${tracks.length}曲, ${formatTimeHours(playlistInfo.totalDuration)}`}</p>
        </div>

        <div className="playlist-detail__header-actions-buttons">
          <button
            className="playlist-detail__header-play-button playlist-detail__header-button"
            onClick={() => {
              playerTrack(queue[0].trackUri);
              playTrackAt(0);
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

      <ul className="playlist-detail__list">
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
              setIsTrackSet={setIsTrackSet}
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
