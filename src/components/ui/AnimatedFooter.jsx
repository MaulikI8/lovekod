import React from 'react';

export default function AnimatedFooter({ children, className = '' }) {
  return (
    <div className={`animated-footer-wrapper ${className}`}>
      {/* Vengeance UI Festive Wave & Glow Header */}
      <div className="footer-animated-wave" aria-hidden="true">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="wave-svg"
        >
          <path
            d="M0 40 C 360 80, 720 0, 1080 40 C 1260 60, 1380 20, 1440 30 V 80 H 0 Z"
            fill="var(--night-surface)"
            fillOpacity="0.8"
          />
          <path
            d="M0 55 C 320 20, 640 70, 960 40 C 1200 15, 1360 50, 1440 45 V 80 H 0 Z"
            fill="var(--kaalo-base)"
          />
        </svg>
        <div className="footer-glow-line" />
      </div>
      <div className="footer-inner-content">
        {children}
      </div>
    </div>
  );
}
