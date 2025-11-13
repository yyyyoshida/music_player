import { useState } from "react";
import useTooltipStore from "../../store/tooltipStore";
import useActionSuccessMessageStore from "../../store/actionSuccessMessageStore";
import VolumeBar from "./VolumeBar";
import { useVisualizerStore } from "../../store/visualizerStore";

const PlayerOptions = () => {
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const setTooltipText = useTooltipStore((state) => state.setTooltipText);
  const handleButtonPress = useTooltipStore((state) => state.handleButtonPress);
  const handleMouseEnter = useTooltipStore((state) => state.handleMouseEnter);
  const handleMouseLeave = useTooltipStore((state) => state.handleMouseLeave);

  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);

  const startVisualizer = useVisualizerStore((state) => state.startVisualizer);
  const stopVisualizer = useVisualizerStore((state) => state.stopVisualizer);
  const isVisualizerActive = useVisualizerStore((state) => state.isVisualizerActive);

  function toggleOpenMenu() {
    handleButtonPress();
    setIsOpenMenu((prev) => !prev);
  }

  function closeMenu() {
    setIsOpenMenu(false);
    showMessage("未実装");
  }

  function handleStartVisualizer() {
    if (!startVisualizer || !stopVisualizer) {
      console.warn("Visualizerがまだ初期化されていない");
      return;
    }

    if (isVisualizerActive) return stopVisualizer();

    startVisualizer();
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
          onMouseEnter={() => {
            setTooltipText("その他のオプション");
            handleMouseEnter();
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
            <li
              className="player-controls__options-item"
              onClick={() => {
                handleStartVisualizer();
                closeMenu();
              }}
            >
              {`波形エフェクトを${isVisualizerActive ? "非表示" : "表示"}`}
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
