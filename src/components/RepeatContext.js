import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

const RepeatContext = createContext();

export const RepeatProvider = ({ children }) => {
  const [isRepeat, setIsRepeat] = useState(false);

  const toggleRepeat = () => {
    setIsRepeat((prev) => !prev);
  };

  return <RepeatContext.Provider value={{ isRepeat, toggleRepeat }}>{children}</RepeatContext.Provider>;
};

export const useRepeatContext = () => useContext(RepeatContext);
