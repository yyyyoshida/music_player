import { useState, useEffect, useContext, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { getNewAccessToken } from "../utils/spotifyAuth";

import { TokenContext } from "../contexts/TokenContext";
import { PlaylistSelectionContext } from "../contexts/PlaylistSelectionContext";
import { TrackInfoProvider } from "../contexts/TrackInfoContext";
import { TrackMoreMenuProvider } from "../contexts/TrackMoreMenuContext";
import { TooltipProvider } from "../contexts/TooltipContext";

import Home from "../react-router-dom/Home";
import SearchResult from "./SearchResult";
import Playlist from "./playlists/Playlist";
import PlaylistDetail from "./playlists/PlaylistDetail";
import CreatePlaylist from "./playlists/CreatePlaylist";
// import Footer from './Footer';

import Login from "./Login";
import ThumbnailPreview from "./ThumbnailPreview";
import PlayerControls from "./player/PlayerControls";
import PlaylistSelection from "./playlists/PlaylistSelection";
import TrackMoreMenu from "./tracks/TrackMoreMenu";
import UploadStatusModal from "./UploadStatusModal";
import ActionSuccessMessage from "./ActionSuccessMessage";
import Tooltip from "./Tooltip";

const Main = ({ setProfile }) => {
  // const [profile, setProfile] = useState(null);
  const { token, setToken, setIsToken } = useContext(TokenContext);
  const { isSelectVisible } = useContext(PlaylistSelectionContext);

  const containerRef = useRef(null);
  const localRefreshToken = localStorage.getItem("refresh_token");

  function cutText(text) {
    // if (!text) return;
    // return text.substring(0, 20);
    return String(text).substring(0, 20);
  }

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("❌ /me 取得失敗。token 無効かも");
          setIsToken(false);
          localStorage.removeItem("access_token");
          console.log("Main.js側：", cutText(localStorage.getItem("refresh_token")));

          if (localRefreshToken) {
            console.log("Main.js側：：ローカルリフレッシュでログイン");
            async function loginWithLocalRefreshToken() {
              try {
                const newToken = await getNewAccessToken(localRefreshToken);
                console.log(cutText(newToken));
                setToken(newToken);
                localStorage.setItem("access_token", newToken);
              } catch {}
            }
            loginWithLocalRefreshToken();
            return;
          }
          return;
        }

        const data = await res.json();
        setProfile(data);
        setIsToken(true);
      } catch (err) {
        console.error("❌ プロフィール取得エラー:", err);
        setIsToken(false);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    console.log("token:", cutText(token));
    console.log("TOKENが変わったよ：Main.js");
  }, [token]);

  return (
    <>
      <Login />

      <div className="container" ref={containerRef}>
        <main>
          <TooltipProvider>
            <TrackInfoProvider>
              <TrackMoreMenuProvider>
                <ThumbnailPreview />
                <TrackMoreMenu />
                <Tooltip />
                {isSelectVisible && <PlaylistSelection />}
                <UploadStatusModal />
                <CreatePlaylist />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search-result" element={<SearchResult containerRef={containerRef} />} />
                  <Route path="/playlist" element={<Playlist />} />
                  <Route path="/playlist-detail/:id" element={<PlaylistDetail containerRef={containerRef} />} />
                </Routes>
                <PlayerControls />
                <ActionSuccessMessage />
              </TrackMoreMenuProvider>
            </TrackInfoProvider>
          </TooltipProvider>
        </main>
        {/* <Footer /> */}
      </div>
    </>
  );
};

export default Main;
