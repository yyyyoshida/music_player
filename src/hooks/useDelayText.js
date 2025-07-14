// import { useState, useEffect, useContext } from "react";
// import { TooltipContext } from "../contexts/TooltipContext";

// const useDelayedText = (initialText, delayedText, isTrue, deps, delay = 600) => {
//   const { setTooltipText, isHovered } = useContext(TooltipContext);
//   const [text, setText] = useState(initialText);

//   // useEffect(() => {
//   //   // const delay = 600;
//   //   const timeoutId = setTimeout(() => {
//   //     setText(isTrue ? initialText : delayedText);
//   //   }, delay);

//   //   return () => clearTimeout(timeoutId);
//   // }, [deps]);

//   // useEffect(() => {
//   //   // setText(isTrue ? initialText : delayedText);
//   //   setTooltipText(isTrue ? initialText : delayedText);
//   // }, [deps, isHovered]);

//   // useEffect(() => {
//   //   setText("dame");
//   // }, []);

//   return text;
// };

// export default useDelayedText;

import { useState, useEffect, useContext } from "react";
import { TooltipContext } from "../contexts/TooltipContext";

const useDelayedText = (isTrue, offText, onText) => {
  const { setTooltipText, isHovered } = useContext(TooltipContext);

  useEffect(() => {
    setTooltipText(isTrue ? offText : onText);
  }, [isTrue]);
};

export default useDelayedText;
