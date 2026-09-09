"use client";

import { useState, useEffect, useRef } from "react";

interface TypeWriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export default function TypeWriter({
  text,
  speed = 50,
  className,
  onComplete,
}: TypeWriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [prevText, setPrevText] = useState(text);
  const indexRef = useRef(0);

  if (prevText !== text) {
    setPrevText(text);
    setDisplayedText("");
  }

  const isDone = displayedText.length >= text.length;

  useEffect(() => {
    indexRef.current = 0;
    if (isDone) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, indexRef.current + 1));
      indexRef.current++;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, isDone, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isDone && (
        <span className="inline-block w-0.5 h-[1em] bg-blue-500 ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}