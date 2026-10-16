export default function GarlandDivider({ className = '' }) {
  return (
    <div className={`garland-divider-wrap ${className}`} aria-hidden="true">
      <svg
        className="garland-divider-svg"
        viewBox="0 0 1200 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <g id="marigold-node">
            {/* Green leaf base */}
            <path d="M-12 2C-6 -4 6 -4 12 2C6 8 -6 8 -12 2Z" fill="#2E5A27" />
            {/* Petals */}
            <circle cx="0" cy="0" r="8" fill="#D35400" />
            <circle cx="-6" cy="0" r="5" fill="#E67E22" />
            <circle cx="6" cy="0" r="5" fill="#E67E22" />
            <circle cx="0" cy="-6" r="5" fill="#F39C12" />
            <circle cx="0" cy="6" r="5" fill="#E67E22" />
            <circle cx="-4" cy="-4" r="4.5" fill="#F1C40F" />
            <circle cx="4" cy="-4" r="4.5" fill="#F1C40F" />
            <circle cx="-4" cy="4" r="4.5" fill="#E67E22" />
            <circle cx="4" cy="4" r="4.5" fill="#E67E22" />
            <circle cx="0" cy="0" r="3" fill="#FFEAA7" />
          </g>
        </defs>

        {/* Hanging thread catenary swag curves */}
        <path
          d="M0 6 Q 75 32, 150 6 Q 225 32, 300 6 Q 375 32, 450 6 Q 525 32, 600 6 Q 675 32, 750 6 Q 825 32, 900 6 Q 975 32, 1050 6 Q 1125 32, 1200 6"
          stroke="#3A5A40"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="2 3"
        />

        {/* Small hanging beads */}
        <path
          d="M0 8 Q 75 36, 150 8 Q 225 36, 300 8 Q 375 36, 450 8 Q 525 36, 600 8 Q 675 36, 750 8 Q 825 36, 900 8 Q 975 36, 1050 8 Q 1125 36, 1200 8"
          stroke="rgba(243,156,18,0.4)"
          strokeWidth="1"
          fill="none"
        />

        {/* Flowers along nodes */}
        <use href="#marigold-node" x="0" y="6" />
        <use href="#marigold-node" x="150" y="6" />
        <use href="#marigold-node" x="300" y="6" />
        <use href="#marigold-node" x="450" y="6" />
        <use href="#marigold-node" x="600" y="6" />
        <use href="#marigold-node" x="750" y="6" />
        <use href="#marigold-node" x="900" y="6" />
        <use href="#marigold-node" x="1050" y="6" />
        <use href="#marigold-node" x="1200" y="6" />

        {/* Center dip flowers (sayapatri droplets) */}
        <circle cx="75" cy="28" r="4" fill="#F39C12" />
        <circle cx="225" cy="28" r="4" fill="#F39C12" />
        <circle cx="375" cy="28" r="4" fill="#F39C12" />
        <circle cx="525" cy="28" r="4" fill="#F39C12" />
        <circle cx="675" cy="28" r="4" fill="#F39C12" />
        <circle cx="825" cy="28" r="4" fill="#F39C12" />
        <circle cx="975" cy="28" r="4" fill="#F39C12" />
        <circle cx="1125" cy="28" r="4" fill="#F39C12" />
      </svg>
    </div>
  );
}
