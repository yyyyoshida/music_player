import React, { useState, useEffect } from 'react';
import Bar from './Bar';
import { music, songs, playSong } from './PlayMusic';
import Tooltip from './Tooltip';
import useButtonTooltip from '../hooks/useButtonTooltip';

const PlayerOptions = () => {
  const { isButtonPressed, isHovered, setIsHovered } = useButtonTooltip();
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  function toggleOpen() {
    setIsOpenMenu((prev) => !prev);
  }

  function clickMenu() {
    toggleOpen();
  }

  return (
    <>
      <div className="player-controls__options">
        <div className="player-controls__volume">
          <Bar ParentClassName="player-controls__volume" type="volume" value="30" />
        </div>
        <button
          className="player-controls__button player-controls__button--more"
          onClick={toggleOpen}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img src="/img/三点リーダーアイコン1.png" alt="" className="player-controls__button--more-icon" />
          <Tooltip isHovered={isHovered} isButtonPressed={isButtonPressed} className={'tooltip-other'} isOpenMenu={isOpenMenu}>
            その他のオプション
          </Tooltip>
        </button>
        <div className={`player-controls__options-menu ${isOpenMenu ? 'is-option' : ''}`}>
          <ul className="player-controls__options-list">
            <li className="player-controls__options-item" onClick={clickMenu}>
              お気に入りに追加
            </li>
            <li className="player-controls__options-item" onClick={clickMenu}>
              スマホ版UIに変更
            </li>
            <li className="player-controls__options-item" onClick={clickMenu}>
              プレイリストから削除する
            </li>
            <li className="player-controls__options-item" onClick={clickMenu}>
              そろそろ飽きた
            </li>
            <li className="player-controls__options-item" onClick={clickMenu}>
              ビートアニメーションを無効化
            </li>
            <li className="player-controls__options-item" onClick={clickMenu}>
              波形エフェクトを非表示
            </li>
            <li className="player-controls__options-item" onClick={clickMenu}>
              楽曲の速度を変更する
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default PlayerOptions;
