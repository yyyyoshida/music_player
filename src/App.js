import { useState, useEffect, useContext } from "react";

import { BrowserRouter } from "react-router-dom";
import { getNewAccessToken, saveRefreshToken, getRefreshToken } from "./utils/spotifyAuth";

import { TokenContext } from "./contexts/isTokenContext";
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
  // const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [token, setToken] = useState(null);

  const [isTrackSet, setIsTrackSet] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { isToken, setIsToken } = useContext(TokenContext);

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
    console.log("hash!!!!!!!!：", hash);
    console.log("🪪 初期 localStorage access_token:", cutText(localAccessToken));
    console.log("🔁 初期 localStorage refresh_token:", cutText(localRefreshToken));

    if (localAccessToken) {
      console.log("◆：：ローカルトークンでログイン");
      setToken(localAccessToken);
      return;
    }

    if (localRefreshToken) {
      console.log("◆：：ローカルリフレッシュでログイン");
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
      console.log("初回ログイン後の処理");
      async function handleInitialSpotifyLogin() {
        try {
          const res = await fetch("http://localhost:4000/api/exchange_token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });

          const data = await res.json();

          console.log("🎫 token交換成功:", cutText(data));

          if (data.access_token) {
            localStorage.setItem("access_token", data.access_token);
            setToken(data.access_token);
          }

          if (data.refresh_token) {
            localStorage.setItem("refresh_token", data.refresh_token);
            await saveRefreshToken(data.refresh_token);

            console.log("💾 保存した refresh_token:", cutText(data.refresh_token));
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
      console.log("◆：：サーバーから取ってログイン");

      async function loginWithServerRefreshToken() {
        try {
          const storedRefreshToken = await getRefreshToken();
          console.log(storedRefreshToken);
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

  useEffect(() => {
    console.log("token:", cutText(token));
    console.log("TOKENが変わったよ：App.js");
  }, [token]);

  // useEffect(() => {
  //   let intervalId;

  //   intervalId = setInterval(
  //     () => {
  //       console.log("トークンが切れたお\('ω')ノ");
  //       localStorage.setItem("access_token", "This is Token null");
  //       // setToken("This is Token null");
  //     },

  //     // 1000 * 60 * 1
  //     1000 * 20 * 1
  //   );
  // }, [token]);

  // useEffect(() => {
  //   console.log("token:", cutText(token));
  //   console.log("localToken:", cutText(localStorage.getItem("access_token")));
  // }, [token]);

  function handleSearchResults(results) {
    setSearchResults(results);
  }

  return (
    <BrowserRouter>
      <ActionSuccessMessageProvider>
        <RepeatProvider>
          <PlayerProvider token={token} isTrackSet={isTrackSet} setIsTrackSet={setIsTrackSet} queue={queue} currentIndex={currentIndex}>
            <PlaybackProvider isTrackSet={isTrackSet} queue={queue} setQueue={setQueue} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex}>
              <SearchProvider>
                <PlaylistProvider>
                  <UploadModalProvider>
                    <PlaylistSelectionProvider>
                      <Header token={token} onSearchResults={handleSearchResults} />
                      <Main token={token} setToken={setToken} searchResults={searchResults} />
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
