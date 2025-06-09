import { useState, useEffect, useContext, useLayoutEffect } from "react";
import Header from "./components/Header";
import Main from "./components/Main";
import Login from "./components/Login";
import { getNewAccessToken } from "./utils/spotifyAuth"; // getNewAccessTokenをインポート
import { SearchProvider } from "./contexts/SearchContext";
import { TokenContext } from "./contexts/isTokenContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { RepeatProvider } from "./contexts/RepeatContext";
import { BrowserRouter } from "react-router-dom";
import { PlaybackProvider } from "./contexts/PlaybackContext";

import { PlaylistProvider } from "./contexts/PlaylistContext";
import { PlaylistSelectionProvider } from "./contexts/PlaylistSelectionContext";
import { UploadModalProvider } from "./contexts/UploadModalContext";

import { ActionSuccessMessageProvider } from "./contexts/ActionSuccessMessageContext";

// import db from './firebase';
// import { collection, getDocs } from 'firebase/firestore';

function App() {
  const [token, setToken] = useState(null);
  const [isTrackSet, setIsTrackSet] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { isToken, setIsToken } = useContext(TokenContext);
  // const {toggle}

  useEffect(() => {
    const hash = window.location.hash;
    const accessToken = window.localStorage.getItem("access_token");
    const refreshToken = window.localStorage.getItem("refresh_token");

    // ① ハッシュがあれば最優先で処理
    if (hash) {
      const parsedToken = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        ?.split("=")[1];

      if (parsedToken) {
        window.localStorage.setItem("access_token", parsedToken);
        setToken(parsedToken);
        window.location.hash = ""; // ハッシュ消す
        return;
      }
    }

    // ② トークンなければ refreshToken から取得
    if (!isToken && refreshToken && !hash) {
      getNewAccessToken()
        .then((newToken) => {
          if (newToken) {
            setToken(newToken);
            window.localStorage.setItem("access_token", newToken);
          }
        })
        .catch((err) => {
          console.error(" トークンの更新失敗:", err);
          // setToken(null);
        });
    }
    // ③ 普通に accessToken があるとき
    else if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  function handleSearchResults(results) {
    setSearchResults(results);
  }

  // if (!token) {
  //   // if (!isToken) {
  //   return <Login />;
  // }

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
                      {/* <h1>Spotifyアプリ</h1> */}
                      {/* {token ? <p>ログイン済み</p> : <p>ログインしていません</p>} */}
                      <Header token={token} onSearchResults={handleSearchResults} />
                      {/* {!token && <Login />} */}
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
