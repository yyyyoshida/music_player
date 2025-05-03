import React, { useContext } from 'react';
// import { PlaylistSelectionContext } from './PlaylistSelectionContext';
import { PlaylistSuccessMessageContext } from '../contexts/PlaylistSuccessMessageContext';

const PlaylistSuccessMessage = () => {
  const { isSongAdded, actionType } = useContext(PlaylistSuccessMessageContext);

  function getMessage() {
    if (actionType === 'add') {
      return '楽曲をプレイリストに追加しました';
    }

    if (actionType === 'remove') {
      return '楽曲をプレイリストから削除しました';
    }

    if (actionType === 'newPlaylist') {
      return '新しいプレイリストを作成しました';
    }

    if (actionType === 'rename') {
      return 'プレイリストの名前を変更しました';
    }
  }

  return (
    <div
      className={`success-message ${isSongAdded ? 'playlist-update-success' : ''}`}
      style={{ visibility: isSongAdded ? 'visible' : 'hidden' }}
    >
      {getMessage()}
    </div>
  );
};

export default PlaylistSuccessMessage;
