import { useEffect, useState, useContext, useRef } from "react";
import { usePlayerContext } from "../contexts/PlayerContext";
import { PlaylistSelectionContext } from "../contexts/PlaylistSelectionContext";
import { playIcon, pauseIcon } from "../assets/icons";
import { PlaybackContext } from "../contexts/PlaybackContext";
import { TokenContext } from "../contexts/TokenContext";

import CardListSkeleton from "../components/skeletonUI/CardListSkeleton";
import useWaitForImagesLoad from "../hooks/useWaitForImagesLoad";
import { divide } from "lodash";

const Home = () => {
  const [tracks, setTracks] = useState([]);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const { playerTrack, isPlaying, trackId, setIsTrackSet } = usePlayerContext();
  const { handleTrackSelect } = useContext(PlaylistSelectionContext);
  const { setQueue } = useContext(PlaybackContext);
  const { token } = useContext(TokenContext);

  const changeCountRef = useRef(0);

  const imagesLoaded = useWaitForImagesLoad("trackList", tracks, [tracks], 21);

  // useEffect(() => {
  //   changeCountRef.current += 1;
  //   if (changeCountRef.current === 2) {
  //     console.log("ホームの中の", token);

  //     if (token) {
  //       localStorage.setItem("access_token", token); // アクセストークンをlocalStorageに保存
  //       // window.location.href = '/home'; // メインページに遷移
  //     } else {
  //       console.error("アクセストークンの取得に失敗しました");
  //     }
  //   }
  //   // }, []);
  // }, [token]);

  // const fetchRecentlyPlayedTracks = async (token) => {
  //   let url = "https://api.spotify.com/v1/me/player/recently-played?limit=50";

  //   if (!token) {
  //     console.error("アクセストークンがありません");
  //     return;
  //   }

  //   try {
  //     const response = await fetch(url, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     const data = await response.json();

  //     setTracks(data.items);
  //   } catch (err) {
  //     console.error("再生履歴取れなかった", err);
  //   }
  // };

  // useEffect(() => {
  //   // console.log('harooooo');
  //   if (token) {
  //     fetchRecentlyPlayedTracks(token);
  //     // console.log('ここだあああ', tracks.items);
  //   }
  // }, [token]);

  // useEffect(() => {
  //   console.log("homeのsetQueueが発火");
  //   setQueue(tracks);
  // }, [tracks]);

  // const [currentPlayedAt, setCurrentPlayedAt] = useState(null);

  // useEffect(() => {
  //   if (imagesLoaded) {
  //     setInitialLoaded(true);
  //   }
  // }, [imagesLoaded]);
  // console.log(tracks[0]);

  return (
    <div className="home">
      <h1 className="home__title">ホーム</h1>
      <p className="home__text">最近再生した曲一覧</p>

      <p className="home__text-info">
        ※ 現在、他のタスクを優先しているため、ローカル曲へはまだ未対応です。エラー回避のため、この一覧は一時的に非表示にしています。
      </p>
    </div>
    // <div className="home">
    //   <h1 className="home__title">ホーム</h1>
    //   <p className="home__text">最近再生した曲一覧</p>

    //   {!initialLoaded && <CardListSkeleton marginTop="55px" />}

    //   <ul className={`home__track-list fade-on-loaded ${!initialLoaded ? "" : "fade-in-up"}`}>
    //     {Array.isArray(tracks) && tracks.length > 0 ? (
    //       tracks.map((track) => {
    //         const isCurrentTrack = trackId === track.track.id && currentPlayedAt === track.played_at;

    //         const isTrackPlaying = isCurrentTrack && isPlaying;
    //         const isClicked = isCurrentTrack;

    //         return (
    //           <li
    //             key={`${track.track.id}-${track.played_at}`}
    //             className="home__track-item"
    //             onClick={() => {
    //               playerTrack(track.track.uri, isClicked);
    //               setIsTrackSet(true);
    //               setCurrentPlayedAt(track.played_at);
    //             }}
    //           >
    //             {/* トラックのカバーアート */}
    //             <div className="home__track-cover-art-wrapper">
    //               <img
    //                 src={track.track.album.images[1].url}
    //                 alt={track.track.name}
    //                 width="188"
    //                 className="home__track-cover-art"
    //                 style={{ filter: isClicked ? "brightness(50%)" : "" }}
    //               />
    //               <button className="home__track-play-pause-button play-pause-button" style={{ visibility: isTrackPlaying ? "visible" : "visible" }}>
    //                 <img
    //                   src={isTrackPlaying ? pauseIcon : playIcon}
    //                   className={`home__track-play-pause-button-icon play-pause-button-icon ${isTrackPlaying ? "pause-button-icon" : "play-button-icon"}`}
    //                 />
    //               </button>
    //               <button
    //                 className="home__track-add-button"
    //                 onClick={(e) => {
    //                   e.stopPropagation();
    //                   handleTrackSelect(track, "recentTrack");
    //                   console.log(track);
    //                 }}
    //               >
    //                 <img src="img/plus.png" className="home__track-add-button-icon" />
    //               </button>

    //               <div className={`equalizer ${isTrackPlaying ? "" : "hidden"}`}>
    //                 <div className="bar"></div>
    //                 <div className="bar"></div>
    //                 <div className="bar"></div>
    //                 <div className="bar"></div>
    //               </div>
    //             </div>

    //             <div className="home__track-info">
    //               <div className="home__track-name">{track.track.name}</div>
    //               <div className="home__track-artist">{track.track.artists[0].name}</div>
    //             </div>
    //           </li>
    //         );
    //       })
    //     ) : (
    //       // トラックが無い場合の表示
    //       <p>最近の再生履歴はありません。</p>
    //     )}
    //   </ul>
    // </div>
  );
};

export default Home;
