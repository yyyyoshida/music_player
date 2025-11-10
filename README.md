# 自分専用音楽プレイヤー
## Spotify曲とPCに保存した曲を共有でプレイリストに管理できるアプリ
<!-- <img width="300" height="180" alt="FireShot Capture 027 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/b4f126db-1b89-4e48-8367-0de0974596c0" /> -->
<img width="300" height="180" alt="FireShot Capture 026 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/09b5d1b5-db46-4392-af5a-7af5ff844f94" />
<!-- <img width="300" height="180" alt="FireShot Capture 031 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/4d1904a0-3dc0-41f7-9edc-59ed5b7a5564" /> -->
<img width="300" height="180" alt="FireShot Capture 025 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/7e8243f8-80ef-4baa-b444-1e33fbe75c2d" />
<!-- <img width="300" height="180" alt="FireShot Capture 032 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/5f68a7ce-d7e7-4d2a-9f6a-7fb87b0714e7" /> -->


このアプリは自分用に作ったSpotify曲とPCに保存した曲を共有でプレイリストに管理できるアプリです。

# 主な機能
  
### Spotify曲の検索・追加
![Videotogif](https://github.com/user-attachments/assets/321e16fa-91d8-4be3-a360-56e8270edce1)

### PCに保存した曲の追加
![local](https://github.com/user-attachments/assets/b2d56be2-0921-4980-bba7-93b7b2dc23c8)

### プレイリストの作成・削除
![playlist-add-delete](https://github.com/user-attachments/assets/3202f393-7e69-456c-853b-453b58475f8a)

### 画面拡大・次の曲 & 前の曲へ移動
![expand](https://github.com/user-attachments/assets/05210ac2-9b33-491c-9f71-b1d46c6d1b66)

### 飽きた曲を一時的に非表示 → 管理 → 復元
![Videotogif](https://github.com/user-attachments/assets/3706191e-cd7f-4ba6-889a-56d7cca77751)

### 飽きた曲の試聴
![sleep-sound](https://github.com/user-attachments/assets/793b44a2-c6da-4ffd-84c2-a9e8a71a03ad)


### デモリンク
URL：https://hogehogehoge <br>
Password：yyyyoshida

※ 外部アクセス防止のため簡易パスワードを設定しています。  
※ 曲の追加・削除など、自由に操作してOKです。

# 開発者向け情報
本アプリは Spotify API と Firebaseを使用しており、 環境変数は公開できないため<br>
ローカル環境での起動は原則できない構成となっています。

動作確認はデモURLから行ってください。

# 開発背景
私は、PCで何か作業をするときに、よく音楽を聴くのですが使っていた音楽配信サービス（Spotify）に聴きたい曲がなかったり、そういうときはYouTubeから曲を保存してWindowsに入ってるメディアプレイヤーでプレイリストを作って聴いてたのですが、ほかにも何度も聞いてると飽きてくる曲が出始めて「聴きたくないけどプレイリストから削除はしたくない」という場面が増えてきました。そういう小さな不便さの積み重ねで「もっと自分にとって使いやすいアプリがあればいいのに」と思うようになり、開発に至りました。<br>それに加えて純粋な好奇心で作りたい欲があったので、それも後押しになりました。


# 使用技術
## フロントエンド
- 言語：TypeScript
- ライブラリ：React、Jest + Testing Library、Zustand
- スタイル：SCSS
## バックエンド
- 言語：TypeScript、Node.js
- フレームワーク：Express
- データベース：Firestore
- ストレージ：Firestorage
- API：Spotify API


# 技術選定
### 【TypeScript】
最初はJavaScriptを使用していたが、コード量が増えるにつれてバグが増えていったので型チェックで早期にバグを検知できるTypeScriptを採用しました。あと、型があることでコードの可読性も上がるし、オブジェクトのプロパティを使おうとしたときにIDEが教えてくれるのが魅力的に感じたからです。
### 【React】
最初はJavaScriptを使っていましたが、アプリに今後もどんどん機能が増えて複雑になっていくと考えたらフレームワーク使った方がいいなと思って、Reactはページをコンポーネントを組み合わせて作れて、パーツを再利用できたり、jsx記法でDOM操作がほぼ不要になり開発効率が上がると思ったからです。
### 【Zustand】
状態のファイル間での共有はContextで全てを管理していましたが、Providerの階層がとても深くなっていってそのせいで画面全体が過剰に再レンダリングされる問題が起きていました。そこでReduxとZustandで迷いましたが、よりシンプルに書けて学習コストが低いZustandを選びました。
### 【SCSS】
昔から使い慣れていたのでSCSSにしました。<br>現在なら、クラス名を考える必要がなく開発スピードが上がるTailwind CSSを選ぶと思います。
### 【Node.js】
バックエンドもJavaScriptで書くことができ、学習コストを抑えることができ、他の言語を一から学ぶより開発スピードが上がると考えたからです。<br>ExpressはNode.jsの解説動画でセットで使っていたのと記述がシンプルになるから使いました。
### 【Firebase】
このアプリは自分用なので無料プランでもキャッシュを利用すれば十分使えるし、他のサービスと比較したときに学習コストが低いのでFirebaseにしました。
### 【Spotify API】


# 工夫した点
#### 工夫した点は以下になります
- Zustandを使用して画面全体の無駄な再レンダリングを防いだ
- キャッシュを利用してデータベースとの無駄な通信を減らした
- 企業向け配慮
- 曲の連続再生で発生する429エラー対策
- 画面の一部がチラつく対策
- コーディング方針　if文の早期リターン


## Zustandを使用して画面全体の無駄な再レンダリングを防いだ
使用技術でも触れましたが、もともと状態管理はContextだけで行っていました。しかし、気づいたらProviderの階層が深くなっており、そのせいで画面全体が過剰に再レンダリングされる問題が起きていました。<br><br>
```javascript
// appファイル内

  return (
    <BrowserRouter>
      <ActionSuccessMessageProvider>
        <RepeatProvider>
          <PlayerProvider isTrackSet={isTrackSet} setIsTrackSet={setIsTrackSet} queue={queue} currentIndex={currentIndex}>
            <PlaybackProvider isTrackSet={isTrackSet} queue={queue} setQueue={setQueue} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex}>
              <SearchProvider>
                <PlaylistProvider>
                  <UploadModalProvider>
                    <PlaylistSelectionProvider>
                      <Header onSearchResults={handleSearchResults} profile={profile} />
                      <Main searchResults={searchResults} setProfile={setProfile} />
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
```
React Developer Toolsで再レンダリングを可視化したものになります ↓
![re-re](https://github.com/user-attachments/assets/1440e04c-13be-4b18-aa64-9862ab8d153a)
<br>
この問題を改善するためにZustandを導入しました。<br><br>
更新頻度の高い状態はZustandの各ストアで管理し、トークンなどの更新頻度が低いものはContextに残すことで、<br>
コンポーネントは必要な状態だけを購読でき、無駄な再レンダリングを大幅に削減することができました。

![re](https://github.com/user-attachments/assets/6b070051-d01f-4869-8c14-fd310abd5dda)


## キャッシュを利用してデータベースとの無駄な通信を減らした
firebaseは従量課金制ですが、一定の量なら無料で使用できるので無料枠に収めるためにキャッシュ（localStorage）でDBのアクセスを最小にしました。

例えばマウント時にデータベースにアクセスしてそのデータをlocalStorageに保存することで２回目以降はそのキャッシュを利用することで無駄な通信を大幅に減らすことができました。<br><br>

現在は、プレイリスト内の曲を追加・削除するときにキャッシュを削除してデータベースから再取得する設計にしていますが、<br>
今後はデータベースの更新のレスポンスを利用してキャッシュを直接更新する設計にすることで、データを再取得せずに済むようにする予定です。<br>
また、IndexedDBの存在も最近知ったため、今後はlocalStorageからIndexedDBに移行することも検討しています。

## 企業側向けUX改善
 もともとこのアプリを利用する際は、Spotifyアカウントでログインが必要でしたが、<br>
ポートフォリオを確認する採用担当の方が動作確認のために毎回ログインするのは手間だと思いました。<br><br>
そこで、ログイン時に取得できるリフレッシュトークンをサーバー側で保持し、アクセストークンを自動で更新する設計にしました。<br>
これにより、採用担当者の方はログインせずにすぐアプリを試すことができるようになり、確認の手間を減らすことができます。

※ このアプリは個人利用・ポートフォリオ用のため、利便性を優先した設計にしています。

## 曲の連続再生で発生する429エラー対策
Spotify APIが2025年5月のアップデートにより、短時間に連続で再生リクエストを送ると、<br>
レートリミットにより429エラーが出る仕様になりました。<br><br>
そこで、曲を切り替える際は0.7秒の遅延を入れてその間は次の再生リクエストを送れないようにしました。<br>
これによりAPI制限に引っかからないようにしました。<br><br>
しかし、この0.7秒間は無反応で「クリックしたのに動かない」感じになってしまったので<br>
再生バーにローディングアニメーションを追加することで視覚的に「今は操作不可」とわかるようになり、<br>
結果的に、レートリミットによる429エラーを回避しつつ、曲切り替え時の操作感も自然に維持できました。

![bar-loading](https://github.com/user-attachments/assets/5326fefa-295a-4e6c-995a-304f266f7a44)


## 画面の一部がチラつく対策
検索結果一覧や、プレイリスト一覧、プレイリスト内の曲を表示する際、画像だけ読み込みが遅れることで、<br>
画面の一部がチラつく問題がありました。<br><br>
これを解決するためにすべての画像の読み込みが完了するまでスケルトンUIを表示するようにしました。<br>
これにより、画面の一部がチラつく問題がなくなりました。<br>
さらにページ間の遷移がスムーズに感じ、安定感がでてUXの向上につながりました。

![search-loading](https://github.com/user-attachments/assets/815549a6-6565-4f8f-8ce5-b844f1cf0217)

![goodgood](https://github.com/user-attachments/assets/1c53f471-0a90-4517-81c7-787f84bbb2ed)



## コーディング方針　if文の早期リターン
本来なら`else if` やネストして書くところを早期リターンで処理を区切りました。
これによりネストが浅くなり、処理の流れを直感的に理解でき、可読性を向上させました。
```typescript
// 一例 ↓

async function initTokenFromCache(): Promise<boolean> {
  const localAccessToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const localRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  // ローカルのトークンでログイン;
  if (localAccessToken && isValidToken()) {
    setToken(localAccessToken);
    console.log("ローカルToken");
    return true;
  }

  // ローカルのリフレッシュトークンでログイン
  if (localRefreshToken) {
    try {
      const newToken = await getNewAccessToken();
      setToken(newToken);
      console.log("ローカルrefresh");
      return true;
    } catch (error) {
      console.warn("ローカルリフレッシュ失敗(次の手段でログイン):", error);
    }
  }

  return false;
}
```


# 反省点


# 実装予定の機能・今後やること


- 最近再生した曲一覧機能の実装
- YoutubeのURLから動画をプレイリストに追加機能の実装
- 歌詞の表示機能の実装
- Spotify APIの認証周りのテストコード
  - その他主要機能のテストコード
- FirebaseをSupabaseに移行してSQLにチャレンジ




### 動作環境




