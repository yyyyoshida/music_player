import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

import { SearchProvider } from "./contexts/SearchContext";
import usePlayerStore from "./store/playerStore";
import useInitSpotifyToken from "./hooks/useInitSpotifyToken";

import Header from "./components/Header";
import Main from "./components/Main";

function App() {
  const [profile, setProfile] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const initPlayer = usePlayerStore((state) => state.initPlayer);
  const player = usePlayerStore((state) => state.player);
  const isSpotifyPlaying = usePlayerStore((state) => state.isSpotifyPlaying);
  const isLocalPlaying = usePlayerStore((state) => state.isLocalPlaying);
  const syncSpotifyPlayerState = usePlayerStore((state) => state.syncSpotifyPlayerState);
  const syncLocalAudioState = usePlayerStore((state) => state.syncLocalAudioState);

  useInitSpotifyToken();

  useEffect(() => {
    let instance;

    (async () => {
      instance = await initPlayer();
    })();

    return () => {
      if (instance?.disconnect) instance.disconnect();
    };
  }, []);

  useEffect(() => {
    const cleanup = syncSpotifyPlayerState();
    return () => cleanup?.();
  }, [player, isSpotifyPlaying]);

  useEffect(() => {
    const cleanup = syncLocalAudioState();
    return () => cleanup?.();
  }, [isLocalPlaying]);

  function handleSearchResults(results) {
    setSearchResults(results);
  }

  return (
    <BrowserRouter>
      <SearchProvider>
        <Header onSearchResults={handleSearchResults} profile={profile} />
        <Main searchResults={searchResults} setProfile={setProfile} />
      </SearchProvider>
    </BrowserRouter>
  );
}

export default App;
