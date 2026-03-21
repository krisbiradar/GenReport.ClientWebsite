import { useState, useEffect } from "react";

export function useTypewriter(text: string, speedMs: number = 10, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    if (!text) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    let currentIndex = 0;
    
    // Always start fresh for a new string in this simple implementation
    setDisplayedText(""); 

    const intervalId = setInterval(() => {
      currentIndex++;
      if (currentIndex <= text.length) {
        setDisplayedText(text.substring(0, currentIndex));
      } else {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, speedMs);

    return () => clearInterval(intervalId);
  }, [text, speedMs, enabled]);

  return { displayedText, isTyping };
}
