import React from 'react';

/**
 * GarlandDivider
 * Full edge-to-edge seamless marigold torana garland divider.
 * Uses an SVG pattern repeated horizontally to span 100% of the viewport seamlessly.
 */
export default function GarlandDivider({ className = '' }) {
  const wrapperClass = 'garland-divider-wrap ' + className;
  return (
    <div className={wrapperClass.trim()} aria-hidden="true">
      <svg
        className="garland-divider-svg"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="42"
      >
        <defs>
          {/* Detailed Nepalese Marigold (Sayapatri) Blossom Node */}
          <g id="marigold-node">
            {/* Green Leaf Calyx */}
            <path d="M-14 2 C-7 -5 7 -5 14 2 C7 8 -7 8 -14 2 Z" fill="#2E5A27" />
            {/* Outer Marigold Petals */}
            <circle cx="0" cy="0" r="9" fill="#D35400" />
            <circle cx="-7" cy="0" r="5.5" fill="#E67E22" />
            <circle cx="7" cy="0" r="5.5" fill="#E67E22" />
            <circle cx="0" cy="-7" r="5.5" fill="#F39C12" />
            <circle cx="0" cy="7" r="5.5" fill="#E67E22" />
            <circle cx="-5" cy="-5" r="5" fill="#F1C40F" />
            <circle cx="5" cy="-5" r="5" fill="#F1C40F" />
            <circle cx="-5" cy="5" r="5" fill="#E67E22" />
            <circle cx="5" cy="5" r="5" fill="#E67E22" />
            {/* Inner Golden Core */}
            <circle cx="0" cy="0" r="3.5" fill="#FFEAA7" />
          </g>

          {/* Repeatable 150px Segment of the Garland Swag */}
          <pattern
            id="garland-swag-pattern"
            x="0"
            y="0"
            width="150"
            height="42"
            patternUnits="userSpaceOnUse"
          >
            {/* Hanging thread catenary swag curve (150px period) */}
            <path
              d="M 0 6 Q 75 32, 150 6"
              stroke="#3A5A40"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="2 3"
            />

            {/* Small hanging beads swag */}
            <path
              d="M 0 8 Q 75 36, 150 8"
              stroke="rgba(243,156,18,0.45)"
              strokeWidth="1"
              fill="none"
            />

            {/* Center dip flower / droplet (sayapatri droplet) */}
            <circle cx="75" cy="28" r="4.5" fill="#F39C12" />
            <circle cx="75" cy="28" r="2" fill="#FFEAA7" />

            {/* Node Blossom anchored at start/end joint */}
            <use href="#marigold-node" x="0" y="6" />
            <use href="#marigold-node" x="150" y="6" />
          </pattern>
        </defs>

        {/* Full-width seamlessly repeating garland */}
        <rect width="100%" height="100%" fill="url(#garland-swag-pattern)" />
      </svg>
    </div>
  );
}
