import useTooltipStore from "../../store/tooltipStore";
import { FAVORITE_ICON, ADD_TO_PLAYLIST_ICON } from "../../assets/icons";

const TrackActionButton = ({ type, clickAction, buttonRef }) => {
  const setTooltipText = useTooltipStore((state) => state.setTooltipText);
  const handleButtonPress = useTooltipStore((state) => state.handleButtonPress);
  const handleMouseEnter = useTooltipStore((state) => state.handleMouseEnter);
  const handleMouseLeave = useTooltipStore((state) => state.handleMouseLeave);

  return (
    <button
      className={`track-item__button track-item__${type}-button`}
      ref={buttonRef}
      onClick={(e) => {
        e.stopPropagation();
        clickAction?.(e);
        handleButtonPress();
      }}
      onMouseEnter={(e) => {
        if (type === "favorite") setTooltipText("お気に入りに追加");
        if (type === "add-playlist") setTooltipText("プレイリストに追加");
        if (type === "more") setTooltipText("その他のオプション");
        handleMouseEnter(e);
      }}
      onMouseLeave={handleMouseLeave}
    >
      {type === "favorite" && <img src={FAVORITE_ICON} />}

      {type === "add-playlist" && <img src={ADD_TO_PLAYLIST_ICON} />}

      {type === "more" && <img src={"/img/more.png"} />}
    </button>
  );
};

export default TrackActionButton;
