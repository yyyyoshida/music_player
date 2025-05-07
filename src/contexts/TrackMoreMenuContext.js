import React, { createContext, useState, useContext, useRef, useEffect } from "react";

export const TrackMoreMenuContext = createContext();

export const TrackMoreMenuProvider = ({ children }) => {
  const [menuPositionTop, setMenuPositionTop] = useState(0);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [trackId, setTrackId] = useState(null);
  const trackIdRef = useRef(null);

  const isMenuVisibleRef = useRef(null);

  useEffect(() => {
    isMenuVisibleRef.current = isMenuVisible;
  }, [isMenuVisible]);

  function toggleMenu(trackId) {
    if (trackId !== trackIdRef.current) {
      trackIdRef.current = trackId;
      setIsMenuVisible(true);
      return;
    }

    if (trackId === trackIdRef.current) {
      setIsMenuVisible((prev) => !prev);
    }
  }

  function closeMenu() {
    setIsMenuVisible(false);
  }

  return (
    <TrackMoreMenuContext.Provider
      value={{
        menuPositionTop,
        setMenuPositionTop,

        isMenuVisible,
        setIsMenuVisible,
        toggleMenu,
        closeMenu,

        trackId,
        setTrackId,

        isMenuVisibleRef,

        isButtonHovered,
        setIsButtonHovered,
      }}
    >
      {children}
    </TrackMoreMenuContext.Provider>
  );
};

export default TrackMoreMenuContext;
