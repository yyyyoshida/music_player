import { createContext, useState, useContext, useEffect, useRef } from "react";

const PlayerContext = createContext();

export const PlayerProvider = ({ children, isTrackSet, setIsTrackSet }) => {
  return (
    <PlayerContext.Provider
      value={{
        isTrackSet,
        setIsTrackSet,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
export const usePlayerContext = () => useContext(PlayerContext);
export default PlayerContext;
