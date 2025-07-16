import React, { createContext, useState, useRef } from "react";

export const ActionSuccessMessageContext = createContext();

export const ActionSuccessMessageProvider = ({ children }) => {
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [actionType, setActionType] = useState("");
  const timerRef = useRef(null);
  const MESSAGE_DISPLAY_DURATION = 3000;

  function showMessage(type) {
    setActionType(type);
    setIsMessageVisible(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    const timerId = setTimeout(() => {
      setIsMessageVisible(false);
    }, MESSAGE_DISPLAY_DURATION);

    return () => clearTimeout(timerId);
  }

  return <ActionSuccessMessageContext.Provider value={{ isMessageVisible, showMessage, actionType }}>{children}</ActionSuccessMessageContext.Provider>;
};

export default ActionSuccessMessageContext;
