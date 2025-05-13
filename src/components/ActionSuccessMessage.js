import React, { useContext } from "react";
// import { PlaylistSelectionContext } from './PlaylistSelectionContext';
import { ActionSuccessMessageContext } from "../contexts/ActionSuccessMessageContext";

const ActionSuccessMessage = () => {
  const { isMessageVisible, actionType } = useContext(ActionSuccessMessageContext);

  function getMessage() {
    if (actionType === "add") {
      return "楽曲をプレイリストに追加しました";
    }

    if (actionType === "deleteTrack") {
      return "楽曲をプレイリストから削除しました";
    }

    if (actionType === "deletePlaylist") {
      return "プレイリストを削除しました";
    }

    if (actionType === "newPlaylist") {
      return "新しいプレイリストを作成しました";
    }

    if (actionType === "rename") {
      return "プレイリストの名前を変更しました";
    }

    if (actionType === "unselected") {
      return "曲がセットされていません";
    }
  }

  return (
    <div className={`success-message ${isMessageVisible ? "playlist-update-success" : ""}`} style={{ visibility: isMessageVisible ? "visible" : "hidden" }}>
      {getMessage()}
    </div>
  );
};

export default ActionSuccessMessage;

// dadfadf
