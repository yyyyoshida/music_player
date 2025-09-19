import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

import { SearchProvider } from "./contexts/SearchContext";
import usePlayerStore from "./store/playerStore";
import useInitSpotifyToken from "./hooks/useInitSpotifyToken";
import useInitSpotifyPlayer from "./hooks/useInitSpotifyPlayer";

import Header from "./components/Header";
import Main from "./components/Main";

function App() {
  const [profile, setProfile] = useState(null);
  const player = usePlayerStore((state) => state.player);
  const isSpotifyPlaying = usePlayerStore((state) => state.isSpotifyPlaying);
  const isLocalPlaying = usePlayerStore((state) => state.isLocalPlaying);
  const syncSpotifyPlayerState = usePlayerStore((state) => state.syncSpotifyPlayerState);
  const syncLocalAudioState = usePlayerStore((state) => state.syncLocalAudioState);

  useInitSpotifyToken();

  useInitSpotifyPlayer();

  useEffect(() => {
    const cleanup = syncSpotifyPlayerState();
    return () => cleanup?.();
  }, [player, isSpotifyPlaying]);

  useEffect(() => {
    const cleanup = syncLocalAudioState();
    return () => cleanup?.();
  }, [isLocalPlaying]);

  return (
    <BrowserRouter>
      <SearchProvider>
        <Header profile={profile} />
        <Main setProfile={setProfile} />
      </SearchProvider>
    </BrowserRouter>
  );
}

export default App;
