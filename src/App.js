import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Main from './components/Main';
import Login from './components/Login';
import { getNewAccessToken } from './utils/spotifyAuth'; // getNewAccessTokenをインポート

function App() {
  const [token, setToken] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  console.log(window.localStorage.getItem('access_token'));

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem('access_token');
    let refreshToken = window.localStorage.getItem('refresh_token');

    if (!token && refreshToken) {
      // アクセストークンがない場合はリフレッシュトークンを使って新しいトークンを取得
      getNewAccessToken()
        .then((newToken) => {
          setToken(newToken);
          window.localStorage.setItem('access_token', newToken); // 新しいトークンをローカルストレージに保存
        })
        .catch((err) => {
          console.error('トークンの更新に失敗しました:', err);
          setToken(null); // トークンが取得できなかった場合はnullをセット
        });
    } else if (token) {
      setToken(token); // 有効なトークンがあればそのまま使用
    }

    if (hash) {
      token = hash
        .substring(1)
        .split('&')
        .find((elem) => elem.startsWith('access_token'))
        .split('=')[1];
      window.localStorage.setItem('access_token', token); // トークンをローカルストレージに保存
      window.location.hash = ''; // URLのハッシュ部分をクリア
    }
  }, []);

  function handleSearchResults(results) {
    setSearchResults(results);
  }

  if (!token) {
    return <Login />;
  }

  return (
    <>
      {/* <h1>Spotifyアプリ</h1> */}
      {/* {token ? <p>ログイン済み</p> : <p>ログインしていません</p>} */}
      <Header token={token} onSearchResults={handleSearchResults} />
      {/* {!token && <Login />} */}
      <Main token={token} searchResults={searchResults} />
    </>
  );
}

export default App;
