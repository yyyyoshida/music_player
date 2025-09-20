import { useEffect } from "react";

const useFadeTransition = (transitionRef, trigger) => {
  const TRANSITION_DELAY_MS = 50;
  function fadeTransition() {
    const element = transitionRef.current;
    element.style.visibility = "visible";
    element.style.opacity = 1;
    function handleTransitionEnd() {
      element.style.visibility = "hidden";
      element.style.opacity = 1;
    }
    setTimeout(() => {
      element.style.opacity = 0;
      element.addEventListener("transitionend", handleTransitionEnd);
    }, TRANSITION_DELAY_MS);
  }

  useEffect(() => {
    fadeTransition();
  }, [trigger]);
};

export default useFadeTransition;
