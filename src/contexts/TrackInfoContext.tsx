import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

type TrackInfoContextType = {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;

  handleTrackInfoClick: () => void;
};

type TrackInfoContextProviderProps = {
  children: ReactNode;
};

const TrackInfoContext = createContext<TrackInfoContextType | null>(null);

export const TrackInfoProvider = ({ children }: TrackInfoContextProviderProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleTrackInfoClick = () => {
    setIsVisible((prev) => !prev);
  };

  return <TrackInfoContext.Provider value={{ isVisible, setIsVisible, handleTrackInfoClick }}>{children}</TrackInfoContext.Provider>;
};

export const useTrackInfoContext = () => {
  const context = useContext(TrackInfoContext);

  if (!context) {
    throw new Error("useTrackInfoContextはTrackInfoProvider内で使用する必要があります");
  }
  return context;
};
