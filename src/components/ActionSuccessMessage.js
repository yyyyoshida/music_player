import { useContext, useEffect, useState } from "react";

import { ActionSuccessMessageContext } from "../contexts/ActionSuccessMessageContext";

const ActionSuccessMessage = () => {
  const { isMessageVisible, actionType } = useContext(ActionSuccessMessageContext);
  const [style, setStyle] = useState({ opacity: 0, right: -350 });

  useEffect(() => {
    if (isMessageVisible) {
      setStyle({ opacity: 1, right: 20 });
    } else {
      setStyle({ opacity: 0, right: -350 });
    }
  }, [isMessageVisible]);

  function getMessage() {
    switch (actionType) {
      case "add":
        return "楽曲をプレイリストに追加しました";

      case "addFailed":
        return (
          <>
            {<img src="/img/failed.png" className="toast-message__icon" />}
            楽曲の追加に失敗しました
          </>
        );

      case "deleteTrack":
        return "楽曲をプレイリストから削除しました";

      case "deleteTrackFailed":
        return "楽曲の削除に失敗しました";

      case "deletePlaylist":
        return "プレイリストを削除しました";

      case "deletePlaylistFailed":
        return "プレイリストの削除に失敗しました";

      case "fetchPlaylistsFailed":
        return "プレイリスト一覧の取得に失敗しました";

      case "fetchPlaylistInfoFailed":
        return "プレイリストのメタ情報取得に失敗しました";

      case "fetchPlaylistDetailFailed":
        return "プレイリストの詳細情報取得に失敗しました";

      case "newPlaylist":
        return "新しいプレイリストを作成しました";

      case "rename":
        return "プレイリストの名前を変更しました";

      case "unselected":
        return "曲がセットされていません";

      case "未実装":
        return "この機能はまだ未実装です";

      default:
        return "通知内容を取得できませんでした";
    }
  }

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
