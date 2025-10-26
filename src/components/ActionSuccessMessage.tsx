import { useEffect, useState } from "react";
import useActionSuccessMessageStore from "../store/actionSuccessMessageStore";
import type { ActionType } from "../types/actionType";

const ActionSuccessMessage = () => {
  const isMessageVisible = useActionSuccessMessageStore((state) => state.isMessageVisible);
  const actionType = useActionSuccessMessageStore((state) => state.actionType);

  const [style, setStyle] = useState({ opacity: 0, right: -350 });

  useEffect(() => {
    if (isMessageVisible) {
      setStyle({ opacity: 1, right: 20 });
    } else {
      setStyle({ opacity: 0, right: -350 });
    }
  }, [isMessageVisible]);

  useEffect(() => {
    return () => {
      const { timerId } = useActionSuccessMessageStore.getState();
      console.log(timerId);
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  function getMessage() {
    const message = messages[actionType];
    if (!message) return "通知内容を取得できませんでした";

    return (
      <>
        {message.success === false && <img src="/img/failed.png" className="toast-message__icon" />}
        {message.text}
      </>
    );
  }

  const messages: Record<ActionType, { text: string; success: boolean }> = {
    add: { text: "楽曲をプレイリストに追加しました", success: true },
    addFailed: { text: "曲の追加に失敗しました", success: false },
    addFailedSpotify: { text: "Spotify曲の追加に失敗しました", success: false },
    addFailedLocal: { text: "ローカル曲の追加に失敗しました", success: false },
    addFailedNewLocal: { text: "PCからの曲をプレイリストに追加失敗", success: false },

    deleteTrack: { text: "楽曲をプレイリストから削除しました", success: true },
    deleteTrackFailed: { text: "楽曲の削除に失敗しました", success: false },

    deletePlaylist: { text: "プレイリストを削除しました", success: true },
    deletePlaylistFailed: { text: "プレイリストの削除に失敗しました", success: false },

    fetchPlaylistsFailed: { text: "プレイリスト一覧の取得に失敗しました", success: false },
    fetchPlaylistInfoFailed: { text: "プレイリストのメタ情報取得に失敗しました", success: false },
    fetchPlaylistDetailFailed: { text: "プレイリストの詳細情報取得に失敗しました", success: false },
    fetchProfileFailed: { text: "プロフィールの取得に失敗しました", success: false },

    newPlaylist: { text: "新しいプレイリストを作成しました", success: true },
    newPlaylistFailed: { text: "プレイリストの作成に失敗しました", success: false },
    rename: { text: "プレイリストの名前を変更しました", success: true },
    renameFailed: { text: "プレイリストの名前の変更失敗しました", success: false },

    deviceNotFound: { text: "404 Device not found: ページをリロードしてください", success: false },
    tokenExpired: { text: "トークン再取得失敗: ページをリロードしてください", success: false },
    playFailed: { text: "曲の再生に失敗: ページをロードしてください", success: false },
    tooFrequent: { text: "曲の切り替えの間隔が短すぎます。", success: false },

    searchFailed: { text: "検索に失敗しました。ページをリロードして再試行してください", success: false },

    sleep: { text: "曲をスリープにしました", success: true },
    sleepFailed: { text: "曲のスリープに失敗しました", success: false },
    sleepFailedSpotify: { text: "Spotify曲のスリープに失敗しました", success: false },
    sleepFailedLocal: { text: "ローカル曲のスリープに失敗しました", success: false },
    sleepTracksFetchFailed: { text: "スリープ曲一覧の取得に失敗しました", success: false },
    sleepSpotifyRestoreFailed: { text: "Spotify曲をスリープからの復元に失敗しました", success: false },

    unselected: { text: "曲がセットされていません", success: false },
    未実装: { text: "この機能はまだ未実装です", success: true },
  };

  return (
    <div
      className="toast-message"
      style={{
        opacity: style.opacity,
        right: style.right,
      }}
    >
      {getMessage()}
    </div>
  );
};

export default ActionSuccessMessage;
