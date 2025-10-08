import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

type RepeatContextType = {
  isRepeat: boolean;
  toggleRepeat: () => void;
};

type RepeatProviderProps = {
  children: ReactNode;
};

export const RepeatContext = createContext<RepeatContextType | null>(null);

export const RepeatProvider = ({ children }: RepeatProviderProps) => {
  const [isRepeat, setIsRepeat] = useState(false);

  const toggleRepeat = () => {
    setIsRepeat((prev) => !prev);
  };

  return <RepeatContext.Provider value={{ isRepeat, toggleRepeat }}>{children}</RepeatContext.Provider>;
};
