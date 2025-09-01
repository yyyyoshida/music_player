import { useState, useContext } from "react";
import useTooltipStore from "../../store/tooltipStore";
import { ActionSuccessMessageContext } from "../../contexts/ActionSuccessMessageContext";
import VolumeBar from "./VolumeBar";

const PlayerOptions = () => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const setTooltipText = useTooltipStore((state) => state.setTooltipText);
  const handleButtonPress = useTooltipStore((state) => state.handleButtonPress);
  const handleMouseEnter = useTooltipStore((state) => state.handleMouseEnter);
  const handleMouseLeave = useTooltipStore((state) => state.handleMouseLeave);
  const { showMessage } = useContext(ActionSuccessMessageContext);

  function toggleOpenMenu() {
    handleButtonPress();
    setIsOpenMenu((prev) => !prev);
  }

  function closeMenu() {
    setIsOpenMenu(false);
    showMessage("未実装");
  }

  return (
    <>
      <div className="player-controls__options">
        <div className="player-controls__volume">
          <VolumeBar initialValue={30} />
        </div>
        <button
          className="player-controls__button player-controls__button--more"
          onClick={toggleOpenMenu}
          onMouseEnter={(e) => {
            setTooltipText("その他のオプション");
            handleMouseEnter(e);
          }}
          onMouseLeave={() => {
            handleMouseLeave();
          }}
        >
          <img src="/img/三点リーダーアイコン1.png" alt="" className="player-controls__button--more-icon" />
        </button>
        <div className={`player-controls__options-menu ${isOpenMenu ? "is-option" : ""}`}>
          <ul className="player-controls__options-list">
            <li className="player-controls__options-item" onClick={closeMenu}>
              お気に入りに追加
            </li>
            {/* <li className="player-controls__options-item" onClick={toggleOpenMenu}>
              スマホ版UIに変更
            </li> */}
            <li className="player-controls__options-item" onClick={closeMenu}>
              プレイリストから削除する
            </li>
            <li className="player-controls__options-item" onClick={closeMenu}>
              そろそろ飽きた
            </li>
            <li className="player-controls__options-item" onClick={closeMenu}>
              ビートアニメーションを無効化
            </li>
            <li className="player-controls__options-item" onClick={closeMenu}>
              波形エフェクトを非表示
            </li>
            {/* <li className="player-controls__options-item" onClick={toggleOpenMenu}>
              楽曲の速度を変更する
            </li> */}
          </ul>
        </div>
      </div>
    </>
  );
};

export default PlayerOptions;
