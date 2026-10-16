import { useState } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/site';

export default function HeroHotspots() {
  const [activeHotspot, setActiveHotspot] = useState(null);
  const hotspots = siteConfig.hero.hotspots;

  return (
    <div className="hero-hotspots-layer" aria-label="Craftsmanship Hotspots">
      {hotspots.map((h) => {
        const isActive = activeHotspot?.id === h.id;

        return (
          <div
            key={h.id}
            className={`hotspot-anchor ${isActive ? 'is-active' : ''}`}
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            {/* Accessible 44px hit-target button */}
            <button
              type="button"
              className="hotspot-trigger-btn"
              onClick={() => setActiveHotspot(isActive ? null : h)}
              onMouseEnter={() => setActiveHotspot(h)}
              onFocus={() => setActiveHotspot(h)}
              aria-label={`Inspect detail: ${h.label}`}
              aria-expanded={isActive}
            >
              <span className="hotspot-pulse-ring" />
              <span className="hotspot-inner-dot" />
            </button>

            {/* Compact Popover Note */}
            {isActive && (
              <div
                className="hotspot-popover"
                role="tooltip"
                onMouseLeave={() => setActiveHotspot(null)}
              >
                <div className="hotspot-popover-header">
                  <span className="hotspot-popover-title">{h.label}</span>
                  <button
                    type="button"
                    className="hotspot-close-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHotspot(null);
                    }}
                    aria-label="Close craft note"
                  >
                    &times;
                  </button>
                </div>
                <p className="hotspot-popover-note">{h.note}</p>
                <Link
                  to={`/product/${h.productSlug}`}
                  className="hotspot-popover-link"
                >
                  <span>View set</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
