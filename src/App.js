import { useState, useEffect, useContext } from "react";

import { BrowserRouter } from "react-router-dom";
import { getNewAccessToken } from "./utils/spotifyAuth";

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
  const [token, setToken] = useState(null);
  const [isTrackSet, setIsTrackSet] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { isToken, setIsToken } = useContext(TokenContext);

  function cutText(text) {
    if (!text) return;
    return text.substring(0, 20);
  }

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    const hash = window.location.hash;
    const localAccessToken = localStorage.getItem("access_token");
    const localRefreshToken = localStorage.getItem("refresh_token");

    console.log("🪪 初期 localStorage access_token:", cutText(localAccessToken));
    console.log("🔁 初期 localStorage refresh_token:", cutText(localRefreshToken));

    // ① codeからのトークン交換が最優先
    if (code) {
      console.log("➀");
      const fetchTokens = async () => {
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

            console.log("💾 保存した refresh_token:", cutText(data.refresh_token));
          }

          window.history.replaceState({}, null, "/");
        } catch (err) {
          console.error("🔥 トークン交換失敗:", err);
        }
      };

      fetchTokens();
      return;
    }

    // ② hashでトークン渡された場合（古いやつ想定）
    if (hash) {
      console.log("②");
      const params = new URLSearchParams(hash.substring(1));
      const parsedToken = params.get("access_token");
      const parsedRefreshToken = params.get("refresh_token");

      if (parsedToken) {
        localStorage.setItem("access_token", parsedToken);
        setToken(parsedToken);
      }

      // refresh_tokenがある場合のみ保存（なければ前のを維持）
      if (parsedRefreshToken) {
        localStorage.setItem("refresh_token", parsedRefreshToken);
        console.log("✅ hashからrefresh_token保存:", parsedRefreshToken);
      } else {
        console.log("refresh_tokenは既存のを維持する");
      }

      window.location.hash = "";
      return;
    }

    // ③ refresh_tokenがあるならアクセストークンを再取得
    if (!localAccessToken && localRefreshToken) {
      console.log("③");
      getNewAccessToken()
        .then((newToken) => {
          if (newToken) {
            setToken(newToken);
            setIsToken(true);
            localStorage.setItem("access_token", newToken);

            console.log("🔄 アクセストークン再取得成功:", cutText(newToken));
            console.log("💾 保存中のrefresh_token:", cutText(localStorage.getItem("refresh_token")));
          } else {
            setIsToken(false);
          }
        })
        .catch((err) => {
          setIsToken(false);
          console.error("🔁 トークンの更新失敗:", err);
        });
    }

    // ④ access_tokenがすでにあるならそのまま使う
    if (localAccessToken) {
      console.log("④");
      setToken(localAccessToken);
    }

    console.log("✅ useEffect 完了時点での refresh_token:", cutText(localStorage.getItem("refresh_token")));
  }, []);

  useEffect(() => {
    let intervalId;

    if (token) {
      intervalId = setInterval(
        () => {
          console.log("毎回10分後のやつ発火");

          getNewAccessToken()
            .then((newToken) => {
              if (newToken) {
                setToken(newToken);
                setIsToken(true);
                window.localStorage.setItem("access_token", newToken);

                console.log("⏱️ 自動更新 access_token:", cutText(newToken));
                console.log("⏱️ 現在のrefresh_token:", cutText(window.localStorage.getItem("refresh_token"))); // ★
              } else {
                setIsToken(false);
              }
            })
            // .catch(console.error);
            .catch((err) => {
              console.error("🔁 トークン更新失敗:", err);
              setIsToken(false);
            });
        },
        1000 * 60 * 10
      );
    }

    return () => clearInterval(intervalId);
  }, [token]);

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
                      <Main token={token} searchResults={searchResults} />
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
