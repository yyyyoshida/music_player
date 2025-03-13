import { useState, useEffect } from 'react';

const useDelayedText = (initialText, delayedText, isTrue, deps) => {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setText(isTrue ? initialText : delayedText);
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [deps]);

  return text;
};

export default useDelayedText;
