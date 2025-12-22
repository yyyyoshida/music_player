import { useRef } from "react";
import { Routes, Route } from "react-router-dom";

import usePlaylistSelectionStore from "../store/playlistSelectionStore";
import useTokenStore from "../store/tokenStore";
import { TrackInfoProvider } from "../contexts/TrackInfoContext";

import Home from "../react-router-dom/Home";
import SearchResult from "./SearchResult";
import Playlist from "./playlists/Playlist";
import PlaylistDetail from "./playlists/PlaylistDetail";
import CreatePlaylist from "./playlists/CreatePlaylist";
// import Footer from './Footer';

import Login from "./Login";
import ServerStartingModal from "./ServerStartingModal";

import ExpandedTrackCoverView from "./ExpandedTrackCoverView";
import PlayerControls from "./player/PlayerControls";
import PlaylistSelection from "./playlists/PlaylistSelection";
import TrackMoreMenu from "./tracks/TrackMoreMenu";
import UploadStatusModal from "./UploadStatusModal";
import ActionSuccessMessage from "./ActionSuccessMessage";
import Tooltip from "./Tooltip";
import Sleep from "./Sleep";

const Main = () => {
  const isSelectVisible = usePlaylistSelectionStore((state) => state.isSelectVisible);
  const isServerStatus = useTokenStore((state) => state.serverStatus);
  const isServerChecking = isServerStatus === "checking";
  const isServerLoginRequired = isServerStatus === "login-required";

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {isServerChecking && <ServerStartingModal />}
      {isServerLoginRequired && <Login />}

      <Login />

      <div className="container" ref={containerRef}>
        <main>
          <TrackInfoProvider>
            <ExpandedTrackCoverView />
            <TrackMoreMenu />
            <Tooltip />
            {isSelectVisible && <PlaylistSelection />}
            <UploadStatusModal />
            <CreatePlaylist />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResult containerRef={containerRef} />} />
              <Route path="/playlist" element={<Playlist />} />
              <Route path="/playlist/:id" element={<PlaylistDetail containerRef={containerRef} />} />
              <Route path="/sleep" element={<Sleep />} />
            </Routes>
            <PlayerControls />
            <ActionSuccessMessage />
          </TrackInfoProvider>
        </main>
        {/* <Footer /> */}
      </div>
    </>
  );
};

export default Main;
//
