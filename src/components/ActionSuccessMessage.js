import { useContext } from "react";

import { ActionSuccessMessageContext } from "../contexts/ActionSuccessMessageContext";

const ActionSuccessMessage = () => {
  const { isMessageVisible, actionType } = useContext(ActionSuccessMessageContext);

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

      case "newPlaylist":
        return "新しいプレイリストを作成しました";

      case "rename":
        return "プレイリストの名前を変更しました";

      case "unselected":
        return "曲がセットされていません";

      default:
        return "";
    }
  }

  return (
    <div className={`toast-message ${isMessageVisible ? "playlist-update-success" : ""}`} style={{ visibility: isMessageVisible ? "visible" : "hidden" }}>
      {getMessage()}
    </div>
  );
};

export default ActionSuccessMessage;
