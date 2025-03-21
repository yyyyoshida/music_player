import { useState, useEffect } from 'react';

const useDelayedText = (initialText, delayedText, isTrue, deps, delay = 600) => {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    // const delay = 600;
    const timeoutId = setTimeout(() => {
      setText(isTrue ? initialText : delayedText);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [deps]);

  return text;
};

export default useDelayedText;
