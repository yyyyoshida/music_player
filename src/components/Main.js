import React, { useState, useEffect, useContext, useLayoutEffect, useRef } from "react";
// import Footer from './Footer';
import PlayerControls from "./PlayerControls";
import ThumbnailPreview from "./ThumbnailPreview";
import { TrackInfoProvider } from "./TrackInfoContext";
import Login from "./Login";
import { TokenContext } from "../contexts/isTokenContext";

import { Routes, Route } from "react-router-dom";
import SearchResult from "./SearchResult";
import Home from "../react-router-dom/Home";

// import LOGIN_URL from '../config/spotifyConfig';

import Playlist from "./Playlist";
import CreatePlaylist from "./CreatePlaylist";
// import { PlaylistProvider } from './PlaylistContext';
import { PlaylistSelectionContext } from "./PlaylistSelectionContext";
import PlaylistSelection from "./PlaylistSelection";
import PlaylistDetail from "./PlaylistDetail";
import ActionSuccessMessage from "./ActionSuccessMessage";
import TrackMoreMenu from "./TrackMoreMenu";
import { TrackMoreMenuProvider } from "../contexts/TrackMoreMenuContext";

const Main = ({ token }) => {
  const [profile, setProfile] = useState(null);
  const { isToken, setIsToken } = useContext(TokenContext);
  const { isSelectVisible } = useContext(PlaylistSelectionContext);

  const containerRef = useRef(null);

  useEffect(() => {
    // useLayoutEffect(() => {
    // setTimeout(() => {
    // console.log(token);
    if (!token) return;

    fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          console.log("アクセストークンが切れています");
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
          throw new Error("予期しないエラー");
        }
      })
      .then((data) => setProfile(data));
    // }, 300);
  }, [token]);

  // useEffect(() => {
  //   console.log('Main.jsの中の', isToken);
  // }, [isToken]);

  let isNotToken = "";

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
      <div className="container" ref={containerRef}>
        <main>
          {/* <PlaylistProvider>
            <PlaylistSelectionProvider> */}
          <TrackInfoProvider>
            <TrackMoreMenuProvider>
              <ThumbnailPreview />

              {/* <PlaylistSelection /> */}
              <TrackMoreMenu />
              {isSelectVisible && <PlaylistSelection />}
              <CreatePlaylist />
              {/* <PlaybackProvider> */}
              <Routes>
                <Route path="/" element={<Home token={token} />} />
                <Route path="/search-result" element={<SearchResult containerRef={containerRef} />} />
                <Route path="/playlist" element={<Playlist />} />
                {/* <Route path="/playlist-detail" element={<PlaylistDetail />} /> */}
                <Route path="/playlist-detail/:id" element={<PlaylistDetail containerRef={containerRef} />} />
              </Routes>
              {/* </PlaybackProvider> */}

              <PlayerControls />
              <ActionSuccessMessage />
            </TrackMoreMenuProvider>
          </TrackInfoProvider>
          {/* </PlaylistSelectionProvider>
          </PlaylistProvider> */}
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

// 色合いが薄くてダサいから何とかする
// サーバー起動時のターミナルの警告を解消する

// ページ遷移時やリロードした時に一瞬出てくるログインページをなんとかする

// ページ遷移時に音量のバーがリセットされるのを防ぐ

// 検索結果からホームに遷移時の表示されるまでをローディングアニメーションを追加

// 再生中なのに色が変わらない問題

// しばらく放置してトークンが切れたときの対処を考える

// いい加減ターミナルの警告文がうるさいからなんとかする

// useContextファイルはcontextフォルダーに入れる【ファイルの整理】

// プレイリスト作成時にWindow内臓のメディアプレイヤーのプレイリストの名前を変更時のモーダルの表示のあの感じを参考にする

// モーダルが表示する時にふわっと現れるようにする

// 可能なら同じ曲があったら最初以外を非表示
// 無理だったら同じ曲が再生中にならないようにする

// ホームの次へボタンと前へボタンの挙動が若干おかしい

//〇〇〇 GitHubにバックアップしたコードの.gitignoreをGitHubから削除する

// スクラッチでネコsigmaをLinux版にする

// PlaylistSelectionにもローディングが必要かもしれない

// READMEを作り込む

// 検索結果でプレイリストに追加するときにロードが発動しちゃう ✅
// 曲を選択して新規プレイリスト作成時に曲が追加されていない問題 ✅
//プレイリスト一覧でちょっと下にスクロールした状態で開くとロードも下にある状態で始まる
// プレイリストで曲を再生すると同じ曲も再生されちゃう
// プレイリスト一覧とかホームとか検索結果一覧とかで１０番目移行の要素には画像読み込みの遅延をかける
// プレイリスト一覧の４つのカバー画像が若干荒い
// プレイリスト一覧の画像の比率を1/1にする
// プレイリスト詳細ページの４つのカバーたまにフェードした後に読み込み遅延
// プレイリスト選択ページでまだ四分割になる
// プルリクエストをやる

// 後でsetTimeoutのマジックナンバーを洗い出す

// プレイリスト作成時の遷移時とかに出てくるログインのモーダルを何とかする
// useFetchPlaylistみたいにfirebase関連の関数をファイルにまとめる？

// 一部の再生中のトラックでも背景が黒にならない

// ２～３コンポーネントでしか使ってないuseContextをカスタムフック化する
