import { createContext, useState, useContext, useEffect } from "react";

export const UploadModalContext = createContext();

export const UploadModalProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  function showUploadModal() {
    setIsVisible(true);
  }

  function hideUploadModal() {
    setIsVisible(false);
  }

  return <UploadModalContext.Provider value={{ isVisible, showUploadModal, hideUploadModal }}>{children}</UploadModalContext.Provider>;
};

export default UploadModalContext;
