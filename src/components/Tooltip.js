import React, { useState, useEffect } from 'react';

const Tooltip = ({ isHovered, isButtonPressed, children, className, isOpenMenu }) => {
  const [tooltipOpacity, setTooltipOpacity] = useState(0);
  const [tooltipVisibility, setTooltipVisibility] = useState('hidden');

  useEffect(() => {
    if (isButtonPressed) {
      setTooltipOpacity(0);
      setTooltipVisibility('hidden');
    } else if (isHovered) {
      setTooltipOpacity(1);
      setTooltipVisibility('visible');
    } else {
      setTooltipOpacity(0);
      setTooltipVisibility('hidden');
    }
  }, [isHovered, isButtonPressed]);

  return (
    <>
      <span
        className={`tooltip ${className}`}
        style={{
          opacity: isOpenMenu ? 0 : tooltipOpacity,
          visibility: tooltipVisibility,
          transition: isOpenMenu ? 'all 0s' : '',
        }}
      >
        {children}
      </span>
    </>
  );
};

export default Tooltip;
