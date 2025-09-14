import { useState, useEffect, useContext } from "react";

import { BrowserRouter } from "react-router-dom";
import { getNewAccessToken, saveRefreshToken, getRefreshToken, isValidToken } from "./utils/spotifyAuth";

import { SearchProvider } from "./contexts/SearchContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import useTokenStore from "./store/tokenStore";
import usePlayerStore from "./store/playerStore";

import Header from "./components/Header";
import Main from "./components/Main";

function App() {
  const [profile, setProfile] = useState(null);
  const [isTrackSet, setIsTrackSet] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const setToken = useTokenStore((state) => state.setToken);
  const setIsToken = useTokenStore((state) => state.setIsToken);
  const initPlayer = usePlayerStore((state) => state.initPlayer);

  useEffect(() => {
    async function init() {
      const code = new URLSearchParams(window.location.search).get("code");
      const localAccessToken = localStorage.getItem("access_token");
      const localRefreshToken = localStorage.getItem("refresh_token");

      // ローカルのトークンでログイン
      if (localAccessToken && (await isValidToken(localAccessToken))) {
        setToken(localAccessToken);
        return;
      }

      // ローカルのリフレッシュトークンでログイン
      if (localRefreshToken) {
        try {
          const newToken = await getNewAccessToken();
          setToken(newToken);
          return;
        } catch (error) {
          console.warn("ローカルリフレッシュ失敗(次の手段でログイン):", error);
        }
      }

      // 初回ログイン後にトークンとリフレッシュトークンを保存
      if (code) {
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
          return;
        } catch (error) {
          console.warn("トークン交換失敗(次の手段でログイン):", error);
        }
      }

      // DBに保存されたリフレッシュトークンでログイン
      if (!localAccessToken && !localRefreshToken) {
        try {
          const storedRefreshToken = await getRefreshToken();
          const newToken = await getNewAccessToken(storedRefreshToken);
          setToken(newToken);
          localStorage.setItem("access_token", newToken);
          localStorage.setItem("refresh_token", storedRefreshToken);

          if (!storedRefreshToken) throw new Error("リフレッシュトークンがサーバーにない");
        } catch (error) {
          setIsToken(false);
          console.error("🔁 トークンの更新失敗 ログインしてください:", error);
        }
      }
    }
    init();
  }, []);

  useEffect(() => {
    let instance;
    (async () => {
      instance = await initPlayer();
    })();

    return () => {
      if (instance?.disconnect) instance.disconnect();
    };
  }, []);

  function handleSearchResults(results) {
    setSearchResults(results);
  }

  return (
    <BrowserRouter>
      <SearchProvider>
        <PlayerProvider isTrackSet={isTrackSet} setIsTrackSet={setIsTrackSet}>
          <Header onSearchResults={handleSearchResults} profile={profile} />
          <Main searchResults={searchResults} setProfile={setProfile} />
        </PlayerProvider>
      </SearchProvider>
    </BrowserRouter>
  );
}

export default App;
