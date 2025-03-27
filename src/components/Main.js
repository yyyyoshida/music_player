import React, { useState, useEffect, useContext } from 'react';
import Footer from './Footer';
import PlayerControls from './PlayerControls';
import ThumbnailPreview from './ThumbnailPreview';
import { PlayerProvider } from './PlayerContext';
import { TrackInfoProvider } from './TrackInfoContext';
import Login from './Login';
import { SearchContext } from './SearchContext';

const Main = ({ token }) => {
  const [profile, setProfile] = useState(null);
  const [isToken, setIsToken] = useState();
  const { query, searchResults } = useContext(SearchContext);

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

  function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  return (
    <div className="container">
      {!isToken && <Login />}
      <main>
        <PlayerProvider>
          <TrackInfoProvider>
            <ThumbnailPreview />
            <section className="search-result">
              <div className="search-result__header">
                <h2 className="search-result__title">{`${query}の検索結果`}</h2>
                <div className="search-result__header-info">
                  <div className="search-result__header-rank">#</div>
                  <p className="search-result__header-title">タイトル</p>
                  <img className="search-result__header-duration" src="img/clock.png"></img>
                </div>
              </div>
              <ul className="search-result__list">
                {searchResults.length > 0 ? (
                  searchResults.map((track) => (
                    <li className="search-result__item" key={track.id}>
                      <div className="search-result__left"></div>
                      <img className="search-result__cover-art" src={track.album.images[0]?.url} alt={track.name} width="50" />
                      <div className="search-result__track-info">
                        <p className="search-result__name">{track.name}</p>
                        <p className="search-result__artist">{track.artists[0]?.name}</p>
                      </div>
                      <div className="search-result__right">
                        <button className="search-result__button--add">
                          <img className="search-result__icon--add" src="img/plus.png"></img>
                        </button>
                        <div className="search-result__track-duration">{formatDuration(track.duration_ms)}</div>
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
