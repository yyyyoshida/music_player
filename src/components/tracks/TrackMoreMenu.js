import { useContext, useRef, useEffect } from "react";
import { FAVORITE_ICON, ADD_TO_PLAYLIST_ICON } from "../../assets/icons";
import { TrackMoreMenuContext } from "../../contexts/TrackMoreMenuContext";
import { PlaylistSelectionContext } from "../../contexts/PlaylistSelectionContext";
import { PlaylistContext } from "../../contexts/PlaylistContext";
import useActionSuccessMessageStore from "../../store/actionSuccessMessageStore";

const TrackMoreMenu = () => {
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);
  const { trackId, isButtonHovered, menuPositionTop, isMenuVisible, setIsMenuVisible, openMenu, closeMenu } = useContext(TrackMoreMenuContext);
  const { toggleSelectVisible } = useContext(PlaylistSelectionContext);
  const { deleteTrack } = useContext(PlaylistContext);
  const menuRef = useRef(null);
  const isButtonHoveredRef = useRef(null);
  const isNotSearchPage = window.location.pathname !== "/search-result";

  useEffect(() => {
    isButtonHoveredRef.current = isButtonHovered;
  }, [isButtonHovered]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!isMenuVisible) return;

      const isClickInMenu = menuRef.current?.contains(e.target);
      const hoveredOverButton = isButtonHoveredRef.current;

      if (!isClickInMenu && !hoveredOverButton) {
        closeMenu();
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuVisible]);

  return (
    <div className={`track-more-menu ${isMenuVisible && "is-open-menu"}`} style={{ top: menuPositionTop }} ref={menuRef}>
      <ul className="track-more-menu__list">
        <li
          className="track-more-menu__item"
          onClick={() => {
            showMessage("未実装");
            closeMenu();
          }}
        >
          <img src={FAVORITE_ICON} className="track-more-menu__item-icon-favorite" />
          お気に入りに追加
        </li>
        <li
          className="track-more-menu__item"
          onClick={() => {
            toggleSelectVisible();
            setIsMenuVisible(false);
          }}
        >
          <img src={ADD_TO_PLAYLIST_ICON} className="track-more-menu__item-icon-add" />
          プレイリストに追加
        </li>
        {isNotSearchPage && (
          <>
            <li
              className="track-more-menu__item"
              onClick={() => {
                deleteTrack(trackId);
                closeMenu();
              }}
            >
              <img src="/img/delete.png" className="track-more-menu__ite-icon-delete" />
              プレイリストから削除
            </li>
            <li
              className="track-more-menu__item"
              onClick={() => {
                showMessage("未実装");
                closeMenu();
              }}
            >
              <img src="/img/うんちアイコン2.png" className="track-more-menu__item-icon-bored" />
              この曲に飽きた
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default TrackMoreMenu;
