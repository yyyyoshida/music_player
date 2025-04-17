import React, { useEffect, useContext, useState } from 'react';
import LOGIN_URL from '../config/spotifyConfig';
import { SearchContext } from './SearchContext';

const Login = () => {
  const { isToken, setIsToken } = useContext(SearchContext);
  const [newIsToken, setNewIsToken] = useState(true);

  const handleLogin = () => {
    window.location.href = LOGIN_URL; // Spotifyの認証ページにリダイレクト
  };

  const DELAY = 300;
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isToken) {
        setNewIsToken(true);
      } else {
        setNewIsToken(false);
      }
    }, DELAY);
    return () => clearTimeout(timer);
  }, [isToken]);

  return (
    <>
      <div className="login" style={{ visibility: newIsToken ? 'hidden' : 'visible' }}>
        <div className="login__smoke"></div>
        <div className="login__card">
          <h2 className="login__title">Spotifyを使った独自の音楽プレイヤー</h2>
          <p className="login__text">
            Spotifyアカウントでログインして、お気に入りの音楽を楽しもう！<br></br>
            自分だけのプレイリストを作ったり、好きな曲を自由に再生できるよ♪<br></br>
            さらに、各自でダウンロードした曲も追加できるよ！<br></br>
            さあ、音楽の世界に飛び込もう！
          </p>

          <button className="login__button" onClick={handleLogin}>
            Spotifyでログイン
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;
