import React, { createContext, useState } from "react";

export const ActionSuccessMessageContext = createContext();

export const ActionSuccessMessageProvider = ({ children }) => {
  // const [isSongAdded, setIsSongAdded] = useState(false);
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  const [actionType, setActionType] = useState("");

  // function toggleisSongAdded(type) {
  function showMessage(type) {
    setActionType(type);

    setIsMessageVisible(true);

    const timerId = setTimeout(() => {
      setIsMessageVisible(false);
    }, 3000);

    return () => clearTimeout(timerId);
  }

  return (
    <ActionSuccessMessageContext.Provider
      value={{ isMessageVisible, showMessage, actionType }}
    >
      {children}
    </ActionSuccessMessageContext.Provider>
  );
};

export default ActionSuccessMessageContext;
