import { createContext, useState } from 'react';

export const TrackInfoContext = createContext();

export const TrackInfoProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleTrackInfoClick = () => {
    setIsVisible((prev) => !prev);
  };

  return <TrackInfoContext.Provider value={{ isVisible, setIsVisible, handleTrackInfoClick }}>{children}</TrackInfoContext.Provider>;
};
