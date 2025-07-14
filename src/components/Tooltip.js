// import { useState, useEffect } from "react";
// import useButtonTooltip from "../hooks/useButtonTooltip";

// const Tooltip = ({ isHovered, isButtonPressed, children, className, isOpenMenu, tooltipPosition }) => {
//   const [tooltipOpacity, setTooltipOpacity] = useState(0);
//   const [tooltipVisibility, setTooltipVisibility] = useState("hidden");
//   // const { tooltipPosition, handleButtonPress, handleMouseEnter, handleMouseLeave } = useButtonTooltip();

//   useEffect(() => {
//     if (isButtonPressed) {
//       setTooltipOpacity(0);
//       setTooltipVisibility("hidden");
//     } else if (isHovered) {
//       setTooltipOpacity(1);
//       setTooltipVisibility("visible");
//     } else {
//       setTooltipOpacity(0);
//       setTooltipVisibility("hidden");
//     }
//   }, [isHovered, isButtonPressed]);

//   useEffect(() => {
//     console.log(tooltipPosition?.x, tooltipPosition?.y);
//   }, [tooltipPosition]);

//   // if (!tooltipPosition) return null;
//   return (
//     <>
//       {/* <span
//         className={`tooltip ${className}`}
//         style={{
//           opacity: isOpenMenu ? 0 : tooltipOpacity,
//           visibility: tooltipVisibility,
//           transition: isOpenMenu ? "all 0s" : "",
//         }}
//       >
//         {children}
//       </span> */}

//       <span
//         className={`tooltip ${className}`}
//         style={{
//           opacity: isOpenMenu ? 0 : tooltipOpacity,
//           visibility: tooltipVisibility,
//           transition: isOpenMenu ? "all 0s" : "",
//           position: "absolute",
//           top: tooltipPosition?.y,
//           left: tooltipPosition?.x - 1200,
//         }}
//       >
//         {children}
//       </span>
//     </>
//   );
// };

// export default Tooltip;

import { useState, useEffect, useContext } from "react";
import useButtonTooltip from "../hooks/useButtonTooltip";
import { TooltipContext } from "../contexts/TooltipContext";

const Tooltip = () => {
  const [tooltipOpacity, setTooltipOpacity] = useState(0);
  const [tooltipVisibility, setTooltipVisibility] = useState("hidden");
  const { isHovered, isButtonPressed, children, className, isOpenMenu, tooltipPosition, tooltipText, setIsHovered, handleMouseEnter, handleMouseLeave } =
    useContext(TooltipContext);
  // const { tooltipPosition, handleButtonPress, handleMouseEnter, handleMouseLeave } = useButtonTooltip();

  useEffect(() => {
    if (isButtonPressed) {
      setTooltipOpacity(0);
      setTooltipVisibility("hidden");
    } else if (isHovered) {
      setTooltipOpacity(1);
      setTooltipVisibility("visible");
    } else {
      setTooltipOpacity(0);
      setTooltipVisibility("hidden");
    }
  }, [isHovered, isButtonPressed]);

  useEffect(() => {
    console.log(isButtonPressed);
  }, [isButtonPressed]);

  // useEffect(() => {
  //   console.log(tooltipPosition?.x, tooltipPosition?.y);
  // }, [tooltipPosition]);

  return (
    <>
      {/* <span
        className={`tooltip ${className}`}
        style={{
          opacity: isOpenMenu ? 0 : tooltipOpacity,
          visibility: tooltipVisibility,
          transition: isOpenMenu ? "all 0s" : "",
        }}
      >
        {children}
      </span> */}

      <span
        className={`tooltip ${className}`}
        style={{
          opacity: isOpenMenu ? 0 : tooltipOpacity,
          visibility: tooltipVisibility,
          transition: isOpenMenu ? "all 0s" : "",
          position: "fixed",
          top: tooltipPosition?.y + 18,
          left: tooltipPosition?.x + 12,
        }}
      >
        {tooltipText}
      </span>
    </>
  );
};

export default Tooltip;
