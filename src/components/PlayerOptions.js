import React from 'react';
import Bar from './Bar';
import { music, songs, playSong } from './PlayMusic';

const PlayerOptions = () => {
  return (
    <>
      <div className="player-controls__options">
        <div className="player-controls__volume">
          {/* <button id="js-volume-button" className="player-controls__button player-controls__button--volume">
            <img src="img/ボリュームアイコン音小.png" alt="" className="player-controls__button--volume-icon" id="js-volume-icon" />
          </button> */}
          <Bar ParentClassName="player-controls__volume" type="volume" value="30" />

          {/* <div id="js-volume-bar-wrapper" className="player-controls__volume-bar--wrapper">
            <div id="js-volume-bar" className="player-controls__volume-bar">
              <div id="js-volume-fill" className="player-controls__volume-fill">
                <div id="js-volume-thumb" className="player-controls__volume-thumb"></div>
              </div>
            </div>
          </div> */}
        </div>
        <button id="js-more-options-button" className="player-controls__button player-controls__button--more">
          <img src="img/三点リーダーアイコン1.png" alt="" className="player-controls__button--more-icon" />
          <span className="tooltip-other tooltip">その他のオプション</span>
        </button>
        <div id="js-options-menu" className="player-controls__options-menu">
          <ul className="player-controls__options-list">
            <li className="player-controls__options-item">お気に入りに追加</li>
            <li className="player-controls__options-item">スマホ版UIに変更</li>
            <li className="player-controls__options-item">プレイリストから削除する</li>
            <li className="player-controls__options-item">そろそろ飽きた</li>
            <li className="player-controls__options-item">ビートアニメーションを無効化</li>
            <li className="player-controls__options-item">波形エフェクトを非表示</li>
            <li className="player-controls__options-item">楽曲の速度を変更する</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default PlayerOptions;
