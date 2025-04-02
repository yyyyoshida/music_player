import React, { useState, useEffect, useContext } from 'react';
import Footer from './Footer';
import PlayerControls from './PlayerControls';
import ThumbnailPreview from './ThumbnailPreview';
import { TrackInfoProvider } from './TrackInfoContext';
import Login from './Login';
import { SearchContext } from './SearchContext';
import SearchResultList from './SearchResultList';

const Main = ({ token }) => {
  const [profile, setProfile] = useState(null);
  const { query, isToken, setIsToken } = useContext(SearchContext);

  useEffect(() => {
    // console.log(token);
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
    <>
      {!isToken && <Login isToken={isToken} />}
      <div className="container">
        <main>
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
              <SearchResultList />
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
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Main;

// やることリスト
// トラックの幅計算関数がSpotify apiのtrackTitleが変わったときに発火するように変更 ✅
// 全画面表示の時にSpotify apiとビートアニメーションを連携する
// 検索バーの全角文字を打つときにカクつく野を改善する
// プレイリストが作られていない状態で次へを押すとどうなるか検証
// Spotifyや他のサービスを見て見た目を変更・改善する
// 曲を検索して表示するときにロード画面を表示する (AmazonMusic見本)
// 可読性をあげる
// マジックナンバーをなくす
// 再生中の曲にビジュアライザーを表示する
// 色合いが薄くてダサいから何とかする
