import { useState } from 'react';

const useButtonTooltip = () => {
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const delay = 600;

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
