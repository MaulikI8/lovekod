import { useEffect, useState } from 'react';

export default function TextGenerateEffect({
  words,
  className = '',
  accentWordIndex = -1,
  accentClassName = 'hero-title-accent',
}) {
  const [complete, setComplete] = useState(false);
  const wordsArray = (words || '').split(' ');

  useEffect(() => {
    const timer = setTimeout(() => {
      setComplete(true);
    }, wordsArray.length * 90 + 300);
    return () => clearTimeout(timer);
  }, [words, wordsArray.length]);

  return (
    <span className={`text-generate-container ${className}`}>
      {wordsArray.map((word, idx) => {
        const isAccent = accentWordIndex >= 0 ? idx >= accentWordIndex : false;
        return (
          <span
            key={`${word}-${idx}`}
            className={`generate-word ${isAccent ? accentClassName : ''} ${complete ? 'revealed' : ''}`}
            style={{
              animationDelay: `${idx * 0.08}s`,
            }}
          >
            {word}{' '}
          </span>
        );
      })}
    </span>
  );
}
