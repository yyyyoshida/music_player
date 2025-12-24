import { useRef, useEffect } from "react";
import { FAVORITE_ICON, ADD_TO_PLAYLIST_ICON, SLEEP_ICON_64PX } from "../../assets/icons";

import useActionSuccessMessageStore from "../../store/actionSuccessMessageStore";
import useTrackMoreMenuStore from "../../store/trackMoreMenuStore";
import usePlaylistStore from "../../store/playlistStore";
import usePlaylistSelectionStore from "../../store/playlistSelectionStore";
import useSleepTracks from "../../hooks/useSleepTracks";

const TrackMoreMenu = () => {
  const showMessage = useActionSuccessMessageStore.getState().showMessage;
  const menuTrackId = useTrackMoreMenuStore((state) => state.menuTrackId);
  const deleteTrack = usePlaylistStore.getState().deleteTrack;
  const isDeletingTrack = usePlaylistStore((state) => state.isDeletingTrack);

  const isTrackMenuButtonHovered = useTrackMoreMenuStore((state) => state.isTrackMenuButtonHovered);
  const trackMenuPositionTop = useTrackMoreMenuStore((state) => state.trackMenuPositionTop);
  const isTrackMenuVisible = useTrackMoreMenuStore((state) => state.isTrackMenuVisible);
  const closeTrackMenu = useTrackMoreMenuStore.getState().closeTrackMenu;

  const openPlaylistSelectModal = usePlaylistSelectionStore.getState().openPlaylistSelectModal;

  const { sleepTrack, isSleepingTrack } = useSleepTracks();
  const menuRef = useRef<HTMLDivElement>(null);
  const isButtonHoveredRef = useRef<boolean>(null);
  const isNotSearchPage = window.location.pathname !== "/search";

  useEffect(() => {
    isButtonHoveredRef.current = isTrackMenuButtonHovered;
  }, [isTrackMenuButtonHovered]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!isTrackMenuVisible) return;

      const isClickInMenu = menuRef.current?.contains(e.target as Node);
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
    <div
      className={`track-more-menu ${isTrackMenuVisible && "is-open-menu"}`}
      style={{ top: trackMenuPositionTop }}
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
    >
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
            openPlaylistSelectModal();
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
              onClick={async () => {
                await deleteTrack(menuTrackId);
                closeTrackMenu();
              }}
            >
              <img src="/img/delete.png" className="track-more-menu__ite-icon-delete" />
              プレイリストから削除
              {isDeletingTrack && <div className="track-more-menu__item-spin-loader spin-loader"></div>}
            </li>
            <li
              className="track-more-menu__item"
              onClick={async () => {
                await sleepTrack();
                closeTrackMenu();
              }}
            >
              <img src={SLEEP_ICON_64PX} className="track-more-menu__item-icon-bored" />
              曲をスリープ
              {isSleepingTrack && <div className="track-more-menu__item-spin-loader spin-loader"></div>}
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default TrackMoreMenu;
