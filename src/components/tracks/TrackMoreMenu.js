import { useContext, useRef, useEffect } from "react";
import { FAVORITE_ICON, ADD_TO_PLAYLIST_ICON } from "../../assets/icons";
import { PlaylistSelectionContext } from "../../contexts/PlaylistSelectionContext";
import useActionSuccessMessageStore from "../../store/actionSuccessMessageStore";
import useTrackMoreMenuStore from "../../store/trackMoreMenuStore";
import usePlaylistStore from "../../store/playlistStore";

const TrackMoreMenu = () => {
  const showMessage = useActionSuccessMessageStore((state) => state.showMessage);
  const menuTrackId = useTrackMoreMenuStore((state) => state.menuTrackId);
  const deleteTrack = usePlaylistStore((state) => state.deleteTrack);
  const isTrackMenuButtonHovered = useTrackMoreMenuStore((state) => state.isTrackMenuButtonHovered);
  const trackMenuPositionTop = useTrackMoreMenuStore((state) => state.trackMenuPositionTop);
  const isTrackMenuVisible = useTrackMoreMenuStore((state) => state.isTrackMenuVisible);
  const closeTrackMenu = useTrackMoreMenuStore((state) => state.closeTrackMenu);

  const { toggleSelectVisible } = useContext(PlaylistSelectionContext);
  const menuRef = useRef(null);
  const isButtonHoveredRef = useRef(null);
  const isNotSearchPage = window.location.pathname !== "/search-result";

  useEffect(() => {
    isButtonHoveredRef.current = isTrackMenuButtonHovered;
  }, [isTrackMenuButtonHovered]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!isTrackMenuVisible) return;

      const isClickInMenu = menuRef.current?.contains(e.target);
      const hoveredOverButton = isButtonHoveredRef.current;

      if (!isClickInMenu && !hoveredOverButton) {
        closeTrackMenu();
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isTrackMenuVisible]);

  return (
    <div className={`track-more-menu ${isTrackMenuVisible && "is-open-menu"}`} style={{ top: trackMenuPositionTop }} ref={menuRef}>
      <ul className="track-more-menu__list">
        <li
          className="track-more-menu__item"
          onClick={() => {
            showMessage("未実装");
            closeTrackMenu();
          }}
        >
          <img src={FAVORITE_ICON} className="track-more-menu__item-icon-favorite" />
          お気に入りに追加
        </li>
        <li
          className="track-more-menu__item"
          onClick={() => {
            toggleSelectVisible();
            closeTrackMenu();
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
                deleteTrack(menuTrackId);
                closeTrackMenu();
              }}
            >
              <img src="/img/delete.png" className="track-more-menu__ite-icon-delete" />
              プレイリストから削除
            </li>
            <li
              className="track-more-menu__item"
              onClick={() => {
                showMessage("未実装");
                closeTrackMenu();
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
