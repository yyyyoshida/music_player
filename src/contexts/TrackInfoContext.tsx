import { createContext, useState } from "react";
import type { ReactNode } from "react";

type TrackInfoContextType = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;

  handleTrackInfoClick: () => void;
};

type TrackInfoContextProviderProps = {
  children: ReactNode;
};

export const TrackInfoContext = createContext<TrackInfoContextType | null>(null);

export const TrackInfoProvider = ({ children }: TrackInfoContextProviderProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleTrackInfoClick = () => {
    setIsVisible((prev) => !prev);
  };

  return <TrackInfoContext.Provider value={{ isVisible, setIsVisible, handleTrackInfoClick }}>{children}</TrackInfoContext.Provider>;
};
