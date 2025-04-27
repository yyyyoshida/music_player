import React, { createContext, useState } from 'react';

export const PlaylistSuccessMessageContext = createContext();

export const PlaylistSuccessMessageProvider = ({ children }) => {
  const [isSongAdded, setIsSongAdded] = useState(false);
  const [actionType, setActionType] = useState('');

  function toggleisSongAdded(type) {
    setActionType(type);

    setIsSongAdded(true);

    const timerId = setTimeout(() => {
      setIsSongAdded(false);
    }, 3000);

    return () => clearTimeout(timerId);
  }

  return (
    <PlaylistSuccessMessageContext.Provider value={{ isSongAdded, toggleisSongAdded, actionType }}>
      {children}
    </PlaylistSuccessMessageContext.Provider>
  );
};

export default PlaylistSuccessMessageContext;
