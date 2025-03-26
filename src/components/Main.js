import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import PlayerControls from './PlayerControls';
import ThumbnailPreview from './ThumbnailPreview';
import { PlayerProvider } from './PlayerContext';
import { TrackInfoProvider } from './TrackInfoContext';
import Login from './Login';

const Main = ({ token }) => {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!token) return;

    fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, [token]);

  if (!token) {
    return <Login />;
  }

  return (
    <div className="container">
      <maidn>
        <PlayerProvider>
          <TrackInfoProvider>
            <ThumbnailPreview />
            <section className="search-result">
              <h2 className="search-result__title">上位の検索結果</h2>
              <ul className="search-result__list">
                <li></li>
              </ul>
            </section>
            {profile ? (
              <div>
                <h3>こんにちは、{profile.display_name} さん！</h3>
                <p>メール: {profile.email}</p>
                <img src={profile.images?.[0]?.url} alt="プロフィール画像" width="100" />
              </div>
            ) : (
              <p>データを取得中...</p> // ユーザー情報が取得されるまで待機
            )}
            {/* <section className="player">
              <div className="video-info">
                <h2 id="js-video-title">動画タイトル</h2>
                <p id="js-video-description">動画の説明がここに入ります。</p>
              </div>




         
              <div className="video-container">
                <div id="js-video-player"></div>
              </div>

              <h1 id="js-music-title">曲名がここに表示されます</h1>
              <div id="js-player-progress">0:00</div>
              <button id="js-prev-button">前の曲</button>
              <button id="js-next-button">次の曲</button>
            </section> */}
            <PlayerControls />
          </TrackInfoProvider>
        </PlayerProvider>
      </maidn>
      <Footer />
    </div>
  );
};

export default Main;
