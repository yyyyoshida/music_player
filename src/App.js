import { useState, useEffect, useContext } from "react";

import { BrowserRouter } from "react-router-dom";
import { getNewAccessToken, saveRefreshToken, getRefreshToken } from "./utils/spotifyAuth";

import { TokenContext } from "./contexts/TokenContext";
import { SearchProvider } from "./contexts/SearchContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { RepeatProvider } from "./contexts/RepeatContext";
import { PlaybackProvider } from "./contexts/PlaybackContext";
import { PlaylistProvider } from "./contexts/PlaylistContext";
import { PlaylistSelectionProvider } from "./contexts/PlaylistSelectionContext";
import { UploadModalProvider } from "./contexts/UploadModalContext";
import { ActionSuccessMessageProvider } from "./contexts/ActionSuccessMessageContext";

import Header from "./components/Header";
import Main from "./components/Main";

function App() {
  const [profile, setProfile] = useState(null);
  const [isTrackSet, setIsTrackSet] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { token, setToken, isToken, setIsToken } = useContext(TokenContext);

  function cutText(text) {
    // if (!text) return;
    // return text.substring(0, 20);
    return String(text).substring(0, 20);
  }

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    const hash = window.location.hash;
    const localAccessToken = localStorage.getItem("access_token");
    const localRefreshToken = localStorage.getItem("refresh_token");

    if (localAccessToken) {
      setToken(localAccessToken);
      return;
    }

    if (localRefreshToken) {
      async function loginWithLocalRefreshToken() {
        try {
          const newToken = await getNewAccessToken(localRefreshToken);
          setToken(newToken);
        } catch {}
      }
      loginWithLocalRefreshToken();
      return;
    }

    if (code) {
      async function handleInitialSpotifyLogin() {
        try {
          const res = await fetch("http://localhost:4000/api/exchange_token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });

          const data = await res.json();

          if (data.access_token) {
            localStorage.setItem("access_token", data.access_token);
            setToken(data.access_token);
          }

          if (data.refresh_token) {
            localStorage.setItem("refresh_token", data.refresh_token);
            await saveRefreshToken(data.refresh_token);
          }

          window.history.replaceState({}, null, "/");
        } catch (err) {
          console.error("🔥 トークン交換失敗:", err);
        }
      }

      handleInitialSpotifyLogin();
      return;
    }

    if (!localAccessToken && !localRefreshToken) {
      async function loginWithServerRefreshToken() {
        try {
          const storedRefreshToken = await getRefreshToken();
          const newToken = await getNewAccessToken(storedRefreshToken);
          setToken(newToken);
          localStorage.setItem("access_token", newToken);
          localStorage.setItem("refresh_token", storedRefreshToken);

          // if (!storedRefreshToken) throw new Error("リフレッシュトークンがサーバーにない");

          // そのrefresh_tokenを使って新しいaccess_tokenをもらう
        } catch (err) {
          setIsToken(false);
          console.error("🔁 トークンの更新失敗:", err);
        }
      }
      loginWithServerRefreshToken();
    }
  }, []);

  function handleSearchResults(results) {
    setSearchResults(results);
  }

  return (
    <BrowserRouter>
      <ActionSuccessMessageProvider>
        <RepeatProvider>
          <PlayerProvider isTrackSet={isTrackSet} setIsTrackSet={setIsTrackSet} queue={queue} currentIndex={currentIndex}>
            <PlaybackProvider isTrackSet={isTrackSet} queue={queue} setQueue={setQueue} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex}>
              <SearchProvider>
                <PlaylistProvider>
                  <UploadModalProvider>
                    <PlaylistSelectionProvider>
                      <Header onSearchResults={handleSearchResults} profile={profile} />
                      <Main searchResults={searchResults} setProfile={setProfile} />
                    </PlaylistSelectionProvider>
                  </UploadModalProvider>
                </PlaylistProvider>
              </SearchProvider>
            </PlaybackProvider>
          </PlayerProvider>
        </RepeatProvider>
      </ActionSuccessMessageProvider>
    </BrowserRouter>
  );
}

export default App;
