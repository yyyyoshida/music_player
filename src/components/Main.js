import React, { useState, useEffect, useContext, useLayoutEffect } from 'react';
import Footer from './Footer';
import PlayerControls from './PlayerControls';
import ThumbnailPreview from './ThumbnailPreview';
import { TrackInfoProvider } from './TrackInfoContext';
import Login from './Login';
import { SearchContext } from './SearchContext';
// import SearchResultList from './SearchResultList';

import db from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SearchResult from './SearchResult';
import Home from '../react-router-dom/Home';

import LOGIN_URL from '../config/spotifyConfig';

import Playlist from './Playlist';
import CreatePlaylist from './CreatePlaylist';
import { PlaylistProvider } from './PlaylistContext';
import { PlaylistSelectionProvider } from './PlaylistSelectionContext';
import PlaylistSelection from './PlaylistSelection';

const Main = ({ token }) => {
  const [profile, setProfile] = useState(null);
  const { query, isToken, setIsToken } = useContext(SearchContext);

  const [tracks, setTrack] = useState([]);

  // useEffect(() => {
  //   // データー取得する
  //   // const trackData = collection(db, 'test');
  //   // getDocs(trackData).then((snapShot) => {
  //   //   console.log(snapShot.docs.map((doc) => doc.data()));
  //   // });
  //   const getData = async () => {
  //     // const querySnapshot = await getDocs(collection(db, 'test'));
  //     const querySnapshot = await getDocs(collection(db, 'playlists'));
  //     querySnapshot.forEach((doc) => {
  //       // console.log(`${doc.id} => ${doc.data()}`);
  //       console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
  //       console.log(`${doc.id} => ${JSON.stringify(doc.data(), null, 2)}`);
  //     });
  //   };
  //   getData();
  // }, []);

  useEffect(() => {
    // useLayoutEffect(() => {
    // setTimeout(() => {
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
          // setIsToken(false);
          setIsToken(false);
          // window.location.href = LOGIN_URL;

          // トークンが切れている場合、新しいアクセストークンを取得する処理に移行
        } else if (res.ok) {
          // console.log('おっけーおっけー');
          // setIsToken(true);
          setIsToken(true);
          return res.json();
        } else {
          throw new Error('予期しないエラー');
        }
      })
      .then((data) => setProfile(data));
    // }, 300);
  }, [token]);

  // useEffect(() => {
  //   console.log('Main.jsの中の', isToken);
  // }, [isToken]);

  let isNotToken = '';

  // useEffect(() => {
  useLayoutEffect(() => {
    // return <Login isToken={isToken}
    if (isToken) {
      isNotToken = true;
    } else {
      isNotToken = false;
    }
    // console.log('ペンパイナッポーアッぽーぺん', isNotToken);
  }, [isToken]);

  // if (!isToken) {
  //   return <Login isToken={isToken}
  // }

  return (
    <>
      {/* {!isToken && <Login isToken={isToken} />} */}
      {/* {!isNotToken && <Login isToken={isToken} visivility={!isNotToken ? 'visible' : 'hidden'} />} */}
      {/* {!isNotToken && <Login isToken={isToken} visivility={isNotToken} />} */}
      <Login />
      {/* <CreatePlaylist /> */}
      <div className="container">
        <main>
          <TrackInfoProvider>
            <ThumbnailPreview />
            <PlaylistProvider>
              <PlaylistSelectionProvider>
                <PlaylistSelection />
                <CreatePlaylist />

                <Routes>
                  <Route path="/" element={<Home token={token} />} />
                  <Route path="/search-result" element={<SearchResult />} />
                  <Route path="/playlist" element={<Playlist />} />
                </Routes>
              </PlaylistSelectionProvider>
            </PlaylistProvider>

            <PlayerControls />
          </TrackInfoProvider>
        </main>
        {/* <Footer /> */}
      </div>
    </>
  );
};

export default Main;

// やることリスト
// トラックの幅計算関数がSpotify apiのtrackTitleが変わったときに発火するように変更 ✅
// 検索結果一覧をコンポーネントで管理追加 ✅
// トラックの抜粋機能をトラックwrapperにoverflow hiddenではみ出した部分を隠すsimple is best
// 初回ログインを２回やらないといけない不具合を解消
// 全画面表示の時にSpotify apiとビートアニメーションを連携する
// 全画面表示のとき、背景が明るいとなんか変だから若干全体を黒くする ✅
// 検索バーの全角文字を打つときにカクつく野を改善する
// プレイリストが作られていない状態で次へを押すとどうなるか検証
// Spotifyや他のサービスを見て見た目を変更・改善する
// 曲を検索して表示するときにロード画面を表示する (AmazonMusic見本)
// 可読性をあげる
// マジックナンバーをなくす
// 再生中の曲にビジュアライザーを表示する ✅
// 色合いが薄くてダサいから何とかする
// サーバー起動時のターミナルの警告を解消する
// ボリュームのバーを触ったときにツールチップで現在の値を１００分率で表示する
// togglePlayPause関数の３つのif文を２つにする
// リピートオフの状態で曲を切り替えるときにisPlayingが連続で切り替わるバグを修正 ✅

// 最近再生した曲一覧のエラー 同じIDだとエラーになる ✅

// ページ遷移時やリロードした時に一瞬出てくるログインページをなんとかする

// ページ遷移時に音量のバーがリセットされるのを防ぐ

// 検索結果からホームに遷移時の表示されるまでをローディングアニメーションを追加

// 再生中なのに色が変わらない問題

// ボタンは_button.scssファイルにちゃんと書く
