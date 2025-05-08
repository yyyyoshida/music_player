import React, { useContext, useRef, useEffect } from "react";
import { TrackMoreMenuContext } from "../contexts/TrackMoreMenuContext";
import { PlaylistSelectionContext } from "./PlaylistSelectionContext";

import { PlaylistContext } from "./PlaylistContext";

const TrackMoreMenu = () => {
  const { trackId, isButtonHovered, menuPositionTop, isMenuVisible, setIsMenuVisible, openMenu, closeMenu } = useContext(TrackMoreMenuContext);
  const { toggleSelectVisible } = useContext(PlaylistSelectionContext);
  const menuRef = useRef(null);
  const isButtonHoveredRef = useRef(null);

  const { deleteTrack, playlistId } = useContext(PlaylistContext);

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuVisible]);

  return (
    <div className={`track-more-menu ${isMenuVisible && "is-open-menu"}`} style={{ top: menuPositionTop }} ref={menuRef}>
      <ul className="track-more-menu__list">
        <li className="track-more-menu__item">
          <img src="/img/ハートのマーク.png" className="track-more-menu__item-icon-favorite" />
          {/* <img src="/img/favorite.png" className="track-more-menu__item-icon-favorite" /> */}
          お気に入りに追加
        </li>
        <li
          className="track-more-menu__item"
          onClick={() => {
            toggleSelectVisible();
            setIsMenuVisible(false);
          }}
        >
          <img src="/img/plus.png" className="track-more-menu__item-icon-add" />
          プレイリストに追加
        </li>
        <li
          className="track-more-menu__item"
          onClick={() => {
            deleteTrack(playlistId, trackId);
            closeMenu();
          }}
        >
          <img src="/img/delete.png" className="track-more-menu__ite-icon-delete" />
          プレイリストから削除
        </li>
        <li className="track-more-menu__item">
          <img src="/img/うんちアイコン2.png" className="track-more-menu__item-icon-bored" />
          この曲に飽きた
        </li>
      </ul>
    </div>
  );
};

export default TrackMoreMenu;
