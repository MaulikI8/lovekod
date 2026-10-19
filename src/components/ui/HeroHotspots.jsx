import { useState } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../config/site';
import { useStore } from '../../context/StoreContext';

export default function HeroHotspots({ hotspots: propHotspots, product }) {
  const [activeHotspot, setActiveHotspot] = useState(null);
  const { siteSettings, products = [] } = useStore();

  // Active showcased product (passed from hero panel, or spotlight, or first catalog item)
  const targetProduct =
    product ||
    products.find((p) => p.id === siteSettings?.spotlightProductId) ||
    products[0] ||
    null;

  const targetId = targetProduct?.id || siteSettings?.spotlightProductId || 'lk-001';

  // Dynamic Hotspots configuration:
  // 1. propHotspots (if passed directly)
  // 2. siteSettings.heroHotspots (configured dynamically by admin)
  // 3. siteConfig.hero.hotspots (fallback default crafted list)
  const baseHotspots =
    propHotspots && propHotspots.length > 0
      ? propHotspots
      : siteSettings?.heroHotspots && Array.isArray(siteSettings.heroHotspots) && siteSettings.heroHotspots.length > 0
      ? siteSettings.heroHotspots
      : siteConfig.hero.hotspots;

  // Resolve dynamic product links and context notes
  const hotspots = baseHotspots.map((h) => {
    // Determine dynamic product slug: if h.productSlug is set and matches an active product, use it;
    // otherwise dynamically route to the live showcased product
    const resolvedSlug =
      h.productSlug && products.some((p) => p.id === h.productSlug)
        ? h.productSlug
        : targetId;

    // Adapt note dynamically if product details are known and hotspot isn't marked custom
    let resolvedNote = h.note;
    if (targetProduct && !h.isCustom) {
      if (h.id === 'dupatta' && targetProduct.fabricType) {
        resolvedNote = `Gossamer ${targetProduct.fabricType.toLowerCase()} with scalloped silver embroidery edging.`;
      } else if (h.id === 'hemline' && targetProduct.name) {
        resolvedNote = `Handcrafted ${targetProduct.name} border with fine needlework.`;
      }
    }

    return {
      ...h,
      productSlug: resolvedSlug,
      note: resolvedNote || h.note,
    };
  });

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
