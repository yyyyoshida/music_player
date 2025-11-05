# 自分専用音楽プレイヤー
URL：https://www.amazon.co.jp/

<!-- <img width="300" height="180" alt="FireShot Capture 027 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/b4f126db-1b89-4e48-8367-0de0974596c0" /> -->
<img width="300" height="180" alt="FireShot Capture 026 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/09b5d1b5-db46-4392-af5a-7af5ff844f94" />
<img width="300" height="180" alt="FireShot Capture 031 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/4d1904a0-3dc0-41f7-9edc-59ed5b7a5564" />
<img width="300" height="180" alt="FireShot Capture 025 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/7e8243f8-80ef-4baa-b444-1e33fbe75c2d" />
<!-- <img width="300" height="180" alt="FireShot Capture 032 - 音楽プレイヤー -  localhost" src="https://github.com/user-attachments/assets/5f68a7ce-d7e7-4d2a-9f6a-7fb87b0714e7" /> -->

## Spotify曲とPCに保存した曲を共有でプレイリストに管理できるアプリ
※ 外部のアクセスを防ぐために簡易なパスワードをかけています。<br>
Password：yyyyoshida

このアプリは自分用に作ったSpotify曲とPCに保存した曲を共有でプレイリストに管理できるアプリです。

# 開発背景
私は、PCで何か作業をするときに、よく音楽を聴くのですが使っていた音楽配信サービス（Spotify）に聴きたい曲がなかったり、

そういうときはYouTubeから曲を保存してWindowsに入ってるメディアプレイヤーでプレイリストを作って聴いてたのですが、

ほかにも何度も聞いてると飽きてくる曲が出始めて「聴きたくないけどプレイリストから削除はしたくない」という場面が増えてきました。

そういう小さな不便さの積み重ねで「もっと自分にとって使いやすいアプリがあればいいのに」と思うようになり、開発に至りました。








# 使用技術

<!-- [![My Skills](https://skillicons.dev/icons?i=firebase,nodejs,express,react,ts,js,sass,)](https://skillicons.dev) -->

## フロントエンド
- 言語：TypeScript
- ライブラリ：React、Jest + Testing Library、Zustand
- スタイル：Scss
## バックエンド
- 言語：TypeScript、Node.js
- フレームワーク：Express
- データベース：Firestore
- ストレージ：Firestorage
- API：Spotify API

### 開発背景

今後追加予定

<!-- 理由は既存の音楽アプリは課金しないと機能に制限がかかってたり、欲しい機能がついてなかったりしたからです。 -->

### 工夫したところ

今後追加予定

### 動作環境

今後追加予定

## Gitブランチ運用について

開発初期（〜2025年5月頃）までは Git の基本的な使い方を学ぶことを目的に、`main` ブランチへ直接コミットしていました。

その後、プロジェクトの構成が安定し、より実践的な開発フローを意識するために、以下のようなブランチ運用ルールを導入しました（2025年6月〜）：

- `main`：リリース用の安定したコード
- `feature/*`：新機能の追加
- `fix/*`：バグ修正
- `refactor/*`：リファクタリング
- `perf/*`: パフォーマンス改善
- `style/*`: CSSやレイアウト調整（機能影響なし）
- `ui/*`: UIコンポーネントの変更・追加

細かい修正（例：文言の変更や1〜2行の調整など）は状況に応じて `main` に直接コミットすることもありますが、基本的にはブランチを切って作業しています。

