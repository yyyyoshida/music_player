import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import PlayerControls from './PlayerControls';
import ThumbnailPreview from './ThumbnailPreview';
import { PlayerProvider } from './PlayerContext';
import { TrackInfoProvider } from './TrackInfoContext';
import Login from './Login';

const Main = ({ token }) => {
  const [profile, setProfile] = useState(null);
  const [searchResults, setSearchResults] = useState([]); // 検索結果を管理するステート
  const [isToken, setIsToken] = useState();

  useEffect(() => {
    console.log(token);
    if (!token) return;

    fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          console.log('アクセストークンが切れています');
          setIsToken(false);
          // トークンが切れている場合、新しいアクセストークンを取得する処理に移行
        } else if (res.ok) {
          console.log('おっけーおっけー');
          setIsToken(true);
          return res.json();
        } else {
          throw new Error('予期しないエラー');
        }
      })
      .then((data) => setProfile(data));
  }, [token]);

  return (
    <div className="container">
      {!isToken && <Login />}
      <main>
        <PlayerProvider>
          <TrackInfoProvider>
            <ThumbnailPreview />
            <section className="search-result">
              <h2 className="search-result__title">上位の検索結果</h2>
              <ul className="search-result__list">
                {searchResults.length > 0 ? (
                  searchResults.map((track) => (
                    <li key={track.id}>
                      <div>
                        <img src={track.album.images[0]?.url} alt={track.name} width="50" />
                        <p>
                          {track.name} - {track.artists[0]?.name}
                        </p>
                      </div>
                    </li>
                  ))
                ) : (
                  <li>検索結果がありません</li>
                )}
              </ul>
            </section>
            {profile ? (
              <div>
                <h3>こんにちは、{profile.display_name} さん！</h3>
                <p>メール: {profile.email}</p>
                <img src={profile.images?.[0]?.url} alt="プロフィール画像" width="100" />
              </div>
            ) : (
              <p>データを取得中...</p>
            )}
            <PlayerControls />
          </TrackInfoProvider>
        </PlayerProvider>
      </main>
      <Footer />
    </div>
  );
};

export default Main;
