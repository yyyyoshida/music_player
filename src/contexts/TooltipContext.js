// import { createContext, useState, useRef, useEffect } from "react";

// export const TooltipContext = createContext();

// export const TooltipProvider = ({ children }) => {
//   const [tooltipText, setTooltipText] = useState("");
//   const [isButtonPressed, setIsButtonPressed] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const [tooltipPosition, setTooltipPosition] = useState(0);

//   const hoverTimeout = useRef(null);

//   const delay = 600;

//   function handleButtonPress() {
//     setIsButtonPressed(true);
//     setTimeout(() => {
//       setIsButtonPressed(false);
//     }, delay);
//   }

//   // function handleMouseEnter(e) {
//   //   hoverTimeout.current = setTimeout(() => {
//   //     setTooltipPosition({ x: e.clientX, y: e.clientY });
//   //     setIsHovered(true);
//   //   }, 500);
//   // }

//   // function handleMouseLeave() {
//   //   if (hoverTimeout.current) {
//   //     clearTimeout(hoverTimeout.current);
//   //     hoverTimeout.current = null;
//   //   }
//   //   setTooltipPosition(null);
//   //   setIsHovered(false);
//   // }

//   // useEffect(() => {
//   //   function trackMousePosition(e) {
//   //     // latestMousePos.current = { x: e.clientX, y: e.clientY };
//   //     setTooltipPosition({ x: e.clientX, y: e.clientY });
//   //   }

//   //   window.addEventListener("mousemove", trackMousePosition);
//   //   return () => {
//   //     window.removeEventListener("mousemove", trackMousePosition);
//   //   };
//   // }, []);

//   const trackMousePosition = (e) => {
//     setTooltipPosition({ x: e.clientX, y: e.clientY });
//   };

//   function handleMouseEnter(e) {
//     hoverTimeout.current = setTimeout(() => {
//       setIsHovered(true);
//       window.addEventListener("mousemove", trackMousePosition);
//     }, 500);
//   }

//   function handleMouseLeave() {
//     if (hoverTimeout.current) {
//       clearTimeout(hoverTimeout.current);
//       hoverTimeout.current = null;
//     }
//     setTooltipPosition(null);
//     setIsHovered(false);
//     window.removeEventListener("mousemove", trackMousePosition);
//   }

//   return (
//     <TooltipContext.Provider
//       value={{
//         tooltipText,
//         setTooltipText,
//         isButtonPressed,
//         isHovered,

//         setIsHovered,
//         tooltipPosition,
//         handleButtonPress,
//         handleMouseEnter,
//         handleMouseLeave,
//       }}
//     >
//       {children}
//     </TooltipContext.Provider>
//   );
// };

// export default TooltipContext;

import { createContext, useState, useRef, useEffect } from "react";

export const TooltipContext = createContext();

export const TooltipProvider = ({ children }) => {
  const [tooltipText, setTooltipText] = useState("");
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  // initialText, delayedText, isTrue, deps
  // const [initilaText, setInitialText] = useState("");
  // const [clickedText, setClickedText] = useState("");

  const hoverTimeout = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  const delay = 600;

  function resolveTooltipText(isTrue, offText, onText) {
    setTooltipText(isTrue ? offText : onText);
  }

  function handleButtonPress() {
    setIsButtonPressed(true);
    setTimeout(() => {
      setIsButtonPressed(false);
    }, delay);
  }

  function handleMouseEnter() {
    hoverTimeout.current = setTimeout(() => {
      setTooltipPosition(mousePositionRef.current);

      setIsHovered(true);
    }, 500);
  }

  function handleMouseLeave() {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setTooltipPosition(null);
    setIsHovered(false);
  }

  useEffect(() => {
    function trackMousePosition(e) {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    }

    window.addEventListener("mousemove", trackMousePosition);
    return () => {
      window.removeEventListener("mousemove", trackMousePosition);
    };
  }, []);

  useEffect(() => {
    console.log(tooltipPosition);
  }, [tooltipPosition]);

  return (
    <TooltipContext.Provider
      value={{
        resolveTooltipText,
        tooltipText,
        setTooltipText,
        isButtonPressed,
        isHovered,
        setIsHovered,
        tooltipPosition,
        handleButtonPress,
        handleMouseEnter,
        handleMouseLeave,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
};

export default TooltipContext;
