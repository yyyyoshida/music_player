# 自分専用音楽プレイヤー
軽いデモ動画




https://github.com/user-attachments/assets/378f68f7-d61b-4af1-ab04-978a845a4683








URL：https://www.amazon.co.jp/

<!-- <img width="300" height="180" alt="FireShot Capture 027 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/b4f126db-1b89-4e48-8367-0de0974596c0" /> -->
<img width="300" height="180" alt="FireShot Capture 026 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/09b5d1b5-db46-4392-af5a-7af5ff844f94" />
<!-- <img width="300" height="180" alt="FireShot Capture 031 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/4d1904a0-3dc0-41f7-9edc-59ed5b7a5564" /> -->
<img width="300" height="180" alt="FireShot Capture 025 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/7e8243f8-80ef-4baa-b444-1e33fbe75c2d" />
<!-- <img width="300" height="180" alt="FireShot Capture 032 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/5f68a7ce-d7e7-4d2a-9f6a-7fb87b0714e7" /> -->

## Spotify曲とPCに保存した曲を共有でプレイリストに管理できるアプリ
※ 外部のアクセスを防ぐために簡易なパスワードをかけています。<br>
Password：yyyyoshida

このアプリは自分用に作ったSpotify曲とPCに保存した曲を共有でプレイリストに管理できるアプリです。

# 開発背景
私は、PCで何か作業をするときに、よく音楽を聴くのですが使っていた音楽配信サービス（Spotify）に聴きたい曲がなかったり、そういうときはYouTubeから曲を保存してWindowsに入ってるメディアプレイヤーでプレイリストを作って聴いてたのですが、ほかにも何度も聞いてると飽きてくる曲が出始めて「聴きたくないけどプレイリストから削除はしたくない」という場面が増えてきました。そういう小さな不便さの積み重ねで「もっと自分にとって使いやすいアプリがあればいいのに」と思うようになり、開発に至りました。








# 使用技術
<details>
  <summary>詳細…</summary>

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

</details>


# 技術選定
<details>
  <summary>詳細…</summary>
  
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

</details>


# 工夫した点
<details>
  <summary>詳細…</summary>

</details>

# 反省点
<details>
  <summary>詳細…</summary>

</details>

# 実装予定の機能・今後やること
<details>
  <summary>詳細…</summary>

- 最近再生した曲一覧機能の実装
- YoutubeのURLから動画をプレイリストに追加機能の実装
- 歌詞の表示機能の実装
- Spotify APIの認証周りのテストコード
  - その他主要機能のテストコード
- FirebaseをSupabaseに移行してSQLにチャレンジ
</details>







### 動作環境




