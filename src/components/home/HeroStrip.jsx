import { useState } from 'react';
import ShimmerButton from '../ui/ShimmerButton';
import HeroHotspots from '../ui/HeroHotspots';
import { ArrowRightIcon } from '../Icons';

/**
 * Full-bleed three-panel strip hero with embroidery hotspots.
 * Mobile: swipeable snap panel with dot indicators.
 * Desktop: hover accordion (flex: 1.6 vs 0.8, 700ms transition).
 */
export default function HeroStrip({ siteSettings, products = [] }) {
  const [mobilePanelIndex, setMobilePanelIndex] = useState(1);
  const [hoveredPanel, setHoveredPanel] = useState(null);

  const centerProduct =
    products.find((p) => p.id === siteSettings?.spotlightProductId) ||
    products[0] ||
    null;
  const leftProduct = products[1] || null;
  const rightProduct = products[2] || null;

  const centerImage = centerProduct?.image || '/images/kurtha-rani-pink.png';
  const leftImage = leftProduct?.image || '/images/kurtha-red-gold.png';
  const rightImage = rightProduct?.image || '/images/kurtha-olive-green.png';

  const panelFlex = (idx) => {
    if (hoveredPanel === null) return idx === 1 ? 1.3 : 0.85;
    return hoveredPanel === idx ? 1.6 : 0.8;
  };

  return (
    <section className="hero-three-panel-strip" aria-label="Festive Kurtha Hero">
      <div className="strip-panels-viewport">
        {/* Panel 1: Royal Red Kurtha */}
        <div
          className={`strip-panel panel-left ${mobilePanelIndex === 0 ? 'mobile-active' : ''}`}
          style={{ flex: panelFlex(0), transition: 'flex 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}
          onMouseEnter={() => setHoveredPanel(0)}
          onMouseLeave={() => setHoveredPanel(null)}
        >
          <img
            src={leftImage}
            alt={leftProduct?.name ? `${leftProduct.name} Festive Kurtha` : 'Royal Red Embroidered Festive Kurtha Set'}
            className="strip-panel-photo"
            style={{ objectPosition: 'center top' }}
            loading="eager"
            fetchPriority="high"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/kurtha-red-gold.png';
            }}
          />
        </div>

        {/* Panel 2 (Center): Rani Pink Kurtha with Hotspots */}
        <div
          className={`strip-panel panel-center ${mobilePanelIndex === 1 ? 'mobile-active' : ''}`}
          style={{ flex: panelFlex(1), transition: 'flex 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}
          onMouseEnter={() => setHoveredPanel(1)}
          onMouseLeave={() => setHoveredPanel(null)}
        >
          <img
            src={centerImage}
            alt={centerProduct?.name ? `${centerProduct.name} Festive Kurtha` : 'Rani Pink Hand-Embroidered Festive Kurtha Set'}
            className="strip-panel-photo"
            style={{ objectPosition: 'center top' }}
            loading="eager"
            fetchPriority="high"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/kurtha-rani-pink.png';
            }}
          />

          {/* Restored Craftsmanship Hotspots with accessible hit-targets & interactive popovers */}
          <HeroHotspots product={centerProduct} siteSettings={siteSettings} />
        </div>

        {/* Panel 3: Olive Green / Sage Kurtha */}
        <div
          className={`strip-panel panel-right ${mobilePanelIndex === 2 ? 'mobile-active' : ''}`}
          style={{ flex: panelFlex(2), transition: 'flex 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}
          onMouseEnter={() => setHoveredPanel(2)}
          onMouseLeave={() => setHoveredPanel(null)}
        >
          <img
            src={rightImage}
            alt={rightProduct?.name ? `${rightProduct.name} Festive Kurtha` : 'Olive Green Zari Festive Kurtha Set'}
            className="strip-panel-photo"
            style={{ objectPosition: 'center top' }}
            loading="eager"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/kurtha-olive-green.png';
            }}
          />
        </div>
      </div>

      {/* Mobile Swipe / Carousel Dot Indicators */}
      <div className="strip-mobile-dots" aria-label="Hero photo navigation">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            type="button"
            className={`strip-dot-btn ${mobilePanelIndex === idx ? 'active' : ''}`}
            onClick={() => setMobilePanelIndex(idx)}
            aria-label={`Show outfit photo ${idx + 1}`}
          />
        ))}
      </div>

      {/* Overlay Block */}
      <div className="hero-overlay-gradient-band">
        <div className="hero-devanagari-full-mark" aria-hidden="true">
          तिहार
        </div>

        <div className="hero-overlay-content">
          <h1 className="hero-revised-headline">
            {siteSettings?.heroTitle || 'Kurtha sets for Bhai Tika'}
          </h1>

          <p className="hero-revised-subtext">
            {siteSettings?.heroSubtitle || 'Georgette and silk, hand-embroidered. Delivering across all 77 districts.'}
          </p>

          <div className="hero-cta-action">
            <ShimmerButton
              href="#collection"
              background="linear-gradient(135deg, #8A5A4D 0%, #C0817A 100%)"
              shimmerColor="#E9D3CB"
              className="hero-foil-cta-btn"
            >
              <span>Shop the Tihar edit</span>
              <ArrowRightIcon size={15} />
            </ShimmerButton>
          </div>
        </div>
      </div>
    </section>
  );
}
