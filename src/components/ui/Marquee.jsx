import React from 'react';

export default function Marquee({
  className = '',
  reverse = false,
  pauseOnHover = true,
  children,
  vertical = false,
  repeat = 4,
  ...props
}) {
  return (
    <div
      {...props}
      className={`magic-marquee-container ${pauseOnHover ? 'pause-on-hover' : ''} ${className}`}
    >
      <div className={`magic-marquee-track ${reverse ? 'reverse' : ''}`}>
        {Array.from({ length: repeat }).map((_, i) => (
          <div key={i} className="magic-marquee-content" aria-hidden={i > 0}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
