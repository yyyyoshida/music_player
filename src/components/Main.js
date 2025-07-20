import { useState, useEffect, useContext, useRef } from "react";
import { Routes, Route } from "react-router-dom";

import { TokenContext } from "../contexts/isTokenContext";
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

const Main = ({ token }) => {
  const [profile, setProfile] = useState(null);
  const { setIsToken } = useContext(TokenContext);
  const { isSelectVisible } = useContext(PlaylistSelectionContext);

  const containerRef = useRef(null);

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
                  <Route path="/" element={<Home token={token} />} />
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
