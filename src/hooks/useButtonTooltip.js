import { useState } from 'react';

const useButtonTooltip = (delay = 600) => {
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  function handleButtonPress() {
    setIsButtonPressed(true);
    setTimeout(() => {
      setIsButtonPressed(false);
    }, delay);
  }
  return {
    isButtonPressed,
    isHovered,
    handleButtonPress,
    setIsHovered,
  };
};

export default useButtonTooltip;
