import { useState, useEffect, useContext, useLayoutEffect, useRef } from "react";
// import Footer from './Footer';
import PlayerControls from "./player/PlayerControls";
import ThumbnailPreview from "./ThumbnailPreview";
import { TrackInfoProvider } from "../contexts/TrackInfoContext";
import Login from "./Login";
import { TokenContext } from "../contexts/isTokenContext";

import { Routes, Route } from "react-router-dom";
import SearchResult from "./SearchResult";
import Home from "../react-router-dom/Home";

// import LOGIN_URL from '../config/spotifyConfig';

import Playlist from "./playlists/Playlist";
import CreatePlaylist from "./playlists/CreatePlaylist";
// import { PlaylistProvider } from './PlaylistContext';
import { PlaylistSelectionContext } from "../contexts/PlaylistSelectionContext";
import PlaylistSelection from "./playlists/PlaylistSelection";
import PlaylistDetail from "./playlists/PlaylistDetail";
import ActionSuccessMessage from "./ActionSuccessMessage";
import TrackMoreMenu from "./tracks/TrackMoreMenu";
import { TrackMoreMenuProvider } from "../contexts/TrackMoreMenuContext";
import UploadStatusModal from "./UploadStatusModal";

const Main = ({ token }) => {
  const [profile, setProfile] = useState(null);
  const { isToken, setIsToken } = useContext(TokenContext);
  const { isSelectVisible } = useContext(PlaylistSelectionContext);

  const containerRef = useRef(null);

  useEffect(() => {
    // useLayoutEffect(() => {
    // setTimeout(() => {
    // console.log(token);
    if (!token) return;

    fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          console.log("アクセストークンが切れています");
          // setIsToken(false);
          setIsToken(false);
          // window.location.href = LOGIN_URL;

          // トークンが切れている場合、新しいアクセストークンを取得する処理に移行
        } else if (res.ok) {
          // console.log('おっけーおっけー');
          // setIsToken(true);
          setIsToken(true);
          return res.json();
        } else {
          throw new Error("予期しないエラー");
        }
      })
      .then((data) => setProfile(data));
    // }, 300);
  }, [token]);

  // useEffect(() => {
  //   console.log('Main.jsの中の', isToken);
  // }, [isToken]);

  let isNotToken = "";

  // useEffect(() => {
  useLayoutEffect(() => {
    // return <Login isToken={isToken}
    if (isToken) {
      isNotToken = true;
    } else {
      isNotToken = false;
    }
    // console.log('ペンパイナッポーアッぽーぺん', isNotToken);
  }, [isToken]);

  // if (!isToken) {
  //   return <Login isToken={isToken}
  // }

  return (
    <>
      {/* {!isToken && <Login isToken={isToken} />} */}
      {/* {!isNotToken && <Login isToken={isToken} visivility={!isNotToken ? 'visible' : 'hidden'} />} */}
      {/* {!isNotToken && <Login isToken={isToken} visivility={isNotToken} />} */}
      <Login />
      {/* <CreatePlaylist /> */}
      <div className="container" ref={containerRef}>
        <main>
          {/* <PlaylistProvider>
            <PlaylistSelectionProvider> */}
          <TrackInfoProvider>
            <TrackMoreMenuProvider>
              <ThumbnailPreview />

              {/* <PlaylistSelection /> */}
              <TrackMoreMenu />
              {isSelectVisible && <PlaylistSelection />}
              <UploadStatusModal />

              <CreatePlaylist />
              {/* <PlaybackProvider> */}
              <Routes>
                <Route path="/" element={<Home token={token} />} />
                <Route path="/search-result" element={<SearchResult containerRef={containerRef} />} />
                <Route path="/playlist" element={<Playlist />} />
                {/* <Route path="/playlist-detail" element={<PlaylistDetail />} /> */}
                <Route path="/playlist-detail/:id" element={<PlaylistDetail containerRef={containerRef} />} />
              </Routes>
              {/* </PlaybackProvider> */}

              <PlayerControls />
              <ActionSuccessMessage />
            </TrackMoreMenuProvider>
          </TrackInfoProvider>
          {/* </PlaylistSelectionProvider>
          </PlaylistProvider> */}
        </main>
        {/* <Footer /> */}
      </div>
    </>
  );
};

export default Main;
