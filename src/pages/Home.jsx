import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import GarlandDivider from '../components/GarlandDivider';
import Spotlight from '../components/ui/Spotlight';
import HeroHotspots from '../components/ui/HeroHotspots';
import { siteConfig } from '../config/site';
import TextGenerateEffect from '../components/ui/TextGenerateEffect';
import ShimmerButton from '../components/ui/ShimmerButton';
import ThreeDCard from '../components/ui/ThreeDCard';
import PerspectiveCarousel from '../components/ui/PerspectiveCarousel';
import InfiniteMovingCards from '../components/ui/InfiniteMovingCards';
import Particles from '../components/ui/Particles';
import {
  DiyaIcon,
  MarigoldIcon,
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  WhatsAppIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
} from '../components/Icons';

export default function Home() {
  const { products, categories, siteSettings, testimonials } = useStore();
  const [activeCategorySlug, setActiveCategorySlug] = useState('all');
  const [mobilePanelIndex, setMobilePanelIndex] = useState(1);

  // Dynamic Content with fallbacks
  const watermark = siteSettings?.heroWatermark || 'LOVEKOD';
  const heroBadgeTag = siteSettings?.heroBadgeNepali || 'Tihar 2083';
  const heroBadgeText = siteSettings?.heroBadgeText || 'Tihar Festive Edit';
  const heroTitleLine1 = siteSettings?.heroTitleLine1 || 'Draped in Light,';
  const heroTitleAccent = siteSettings?.heroTitleAccent || 'Crafted for Celebration';
  const heroSubtitle = siteSettings?.heroSubtitle || 'Intricately embroidered georgettes, pure chanderi silks, and regal zari borders. Consciously curated for Laxmi Puja, Bhai Tika, and cherished gatherings across Nepal.';
  const heroImage = siteSettings?.heroImage || '/images/hero-banner.jpg';
  const heroTrust1 = siteSettings?.heroTrustItem1 || 'Free Nepal Delivery > Rs. 3,000';
  const heroTrust2 = siteSettings?.heroTrustItem2 || 'Pure Georgette & Silk';
  const heroTrust3 = siteSettings?.heroTrustItem3 || 'Ready for Bhai Tika';

  // Story Settings
  const storyTag = siteSettings?.storyTag || 'Our Story • The LoveKod Ethos';
  const storyTitle = siteSettings?.storyTitle || 'Rooted in the Valley, Lit for the Nation';
  const storyP1 = siteSettings?.storyP1 || 'LoveKod was born out of a simple observation: Nepali women deserve festive attire that looks regal under the evening lights of Tihar without sacrificing comfort during day-long Bhai Tika ceremonies.';
  const storyP2 = siteSettings?.storyP2 || 'We work exclusively with small batches of pure georgette, tissue chanderi, and silk blends. Each garment is measured against Nepali standard fits with generous seam allowances, so you can celebrate without worries.';
  const storyQuote = siteSettings?.storyQuote || 'When you welcome Laxmi into your home, let your attire celebrate both tradition and modern ease.';
  const storyQuoteAuthor = siteSettings?.storyQuoteAuthor || 'The LoveKod Studio, Kathmandu';

  // Base Diya Count
  const baseDiyas = siteSettings?.diyasLitCount || 108;

  // "Light a Diya" signature interaction
  const [diyasCount, setDiyasCount] = useState(() => {
    try {
      const saved = localStorage.getItem('lovekod_diyas_lit');
      return saved ? parseInt(saved, 10) : baseDiyas;
    } catch {
      return baseDiyas;
    }
  });
  const [userDiyaLit, setUserDiyaLit] = useState(() => {
    try {
      return localStorage.getItem('lovekod_user_diya_lit') === 'true';
    } catch {
      return false;
    }
  });
  const [diyaJustLit, setDiyaJustLit] = useState(false);

  const handleLightDiya = () => {
    if (userDiyaLit) return;
    const newCount = diyasCount + 1;
    setDiyasCount(newCount);
    setUserDiyaLit(true);
    setDiyaJustLit(true);
    try {
      localStorage.setItem('lovekod_diyas_lit', newCount.toString());
      localStorage.setItem('lovekod_user_diya_lit', 'true');
    } catch { /* ignore */ }
    setTimeout(() => setDiyaJustLit(false), 2000);
  };

  // Filter Products by Category Slug
  const filteredProducts = products.filter(p => {
    if (activeCategorySlug === 'all') return true;
    const cat = categories.find(c => c.slug === activeCategorySlug);
    if (!cat) return true;
    if (p.categoryId && (p.categoryId === cat.id || p.categoryId === cat.id.toString())) {
      return true;
    }
    if (p.category && (p.category.slug === activeCategorySlug || p.category.id === cat.id)) {
      return true;
    }
    const term = cat.name.toLowerCase();
    if (term.includes('georgette') && p.fabricType?.toLowerCase().includes('georgette')) return true;
    if (term.includes('silk') && p.fabricType?.toLowerCase().includes('silk')) return true;
    if ((term.includes('3-piece') || term.includes('3 piece')) && p.pieces?.toLowerCase().includes('3 piece')) return true;
    if (term.includes('co-ord') && p.pieces?.toLowerCase().includes('co-ord')) return true;
    if (p.fabricType && term.includes(p.fabricType.toLowerCase())) return true;
    return false;
  });

  // Spotlight featured product
  const spotlightPid = siteSettings?.spotlightProductId || 'lk-001';
  const featuredProduct = products.find(p => p.id === spotlightPid) || products[0];

  const getWaLink = (product) => {
    const phone = siteSettings?.contactWhatsapp || '9779800000000';
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const text = encodeURIComponent(
      `Namaste LoveKod! I would like to inquire about "${product.name}" (Rs. ${product.price.toLocaleString()}) for Tihar. Is it available in stock?`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <div className="home-container">
            {/* ── 1. PHASE 1 REVISION — FULL-BLEED THREE-PANEL STRIP HERO ── */}
      <section className="hero-three-panel-strip" aria-label="Festive Kurtha Hero">
        {/* Full-width 3-panel container */}
        <div className="strip-panels-viewport">
          {/* Panel 1: Royal Red Kurtha */}
          <div className={`strip-panel panel-left ${mobilePanelIndex === 0 ? 'mobile-active' : ''}`}>
            <img
              src="/images/kurtha-red-gold.png"
              alt="Royal Red Embroidered Festive Kurtha Set"
              className="strip-panel-photo"
              style={{ objectPosition: 'center 18%' }}
              loading="eager"
              fetchPriority="high"
            />
          </div>

          {/* Panel 2 (Center): Rani Pink Kurtha with Hotspots */}
          <div className={`strip-panel panel-center ${mobilePanelIndex === 1 ? 'mobile-active' : ''}`}>
            <img
              src="/images/kurtha-rani-pink.png"
              alt="Rani Pink Hand-Embroidered Festive Kurtha Set"
              className="strip-panel-photo"
              style={{ objectPosition: 'center 15%' }}
              loading="eager"
              fetchPriority="high"
            />
            {/* Craft Hotspots on Center Panel Only */}
            <HeroHotspots />
          </div>

          {/* Panel 3: Olive Green / Sage Kurtha */}
          <div className={`strip-panel panel-right ${mobilePanelIndex === 2 ? 'mobile-active' : ''}`}>
            <img
              src="/images/kurtha-olive-green.png"
              alt="Olive Green Zari Festive Kurtha Set"
              className="strip-panel-photo"
              style={{ objectPosition: 'center 18%' }}
              loading="eager"
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

        {/* Overlay Block across the bottom on soft paper-to-transparent gradient */}
        <div className="hero-overlay-gradient-band">
          {/* Devanagari background mark in FULL at ~18% opacity in --rose-light */}
          <div className="hero-devanagari-full-mark" aria-hidden="true">
            तिहार
          </div>

          <div className="hero-overlay-content">
            <h1 className="hero-revised-headline">
              Kurtha sets for Bhai Tika
            </h1>

            <p className="hero-revised-subtext">
              Georgette and silk, hand-embroidered. Free delivery above Rs. 3,000.
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

      {/* ── 3. GARLAND DIVIDER ── */}
      <GarlandDivider className="section-divider" />

      {/* ── 4. OVERSIZED EDITORIAL PRODUCT FEATURE (DYNAMIC) ── */}
      {featuredProduct && (
        <section className="featured-spotlight-section" id="featured">
          <div className="featured-spotlight-card">
            <div className="spotlight-visual">
              <img
                src={featuredProduct.image}
                alt={featuredProduct.name}
                className="spotlight-img"
              />
              <div className="spotlight-tag-cut">
                <span>The Centerpiece of Tihar</span>
              </div>
            </div>

            <div className="spotlight-story">
              <div className="spotlight-label">
                <MarigoldIcon size={16} />
                <span>{siteSettings?.spotlightBadge || 'Signature Tihar Set'}</span>
              </div>
              <h2 className="spotlight-title">{siteSettings?.spotlightTitle || featuredProduct.name}</h2>
              

              <p className="spotlight-desc">
                {siteSettings?.spotlightDesc || featuredProduct.description}
              </p>

              <div className="spotlight-highlights">
                <div className="highlight-item">
                  <CheckIcon size={16} />
                  <span>Includes {featuredProduct.pieces}: Kurtha, Matching Lower &amp; Dupatta</span>
                </div>
                <div className="highlight-item">
                  <CheckIcon size={16} />
                  <span>Breathable featherlight drape suitable for long puja rituals</span>
                </div>
                <div className="highlight-item">
                  <CheckIcon size={16} />
                  <span>Pre-inspected seams with tailored ease for movement</span>
                </div>
              </div>

              <div className="spotlight-price-row">
                <div className="spotlight-prices">
                  <span className="price-bold tabular-num">Rs. {featuredProduct.price.toLocaleString()}</span>
                  {featuredProduct.originalPrice && (
                    <span className="price-mrp tabular-num">Rs. {featuredProduct.originalPrice.toLocaleString()}</span>
                  )}
                  {featuredProduct.originalPrice && (
                    <span className="discount-tag">
                      {Math.round(((featuredProduct.originalPrice - featuredProduct.price) / featuredProduct.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>

                <div className="spotlight-actions">
                  <Link to={`/product/${featuredProduct.id}`} className="btn-primary-marigold">
                    <span>Inspect Details &amp; Sizes</span>
                    <ArrowRightIcon size={16} />
                  </Link>
                  <a
                    href={getWaLink(featuredProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-square"
                    title="Inquire via WhatsApp"
                    aria-label="Inquire on WhatsApp"
                  >
                    <WhatsAppIcon size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 5. GARLAND DIVIDER ── */}
      <GarlandDivider className="section-divider" />

      {/* ── 6. CURATED FESTIVE COLLECTION (DYNAMIC CATEGORIES & ITEMS) ── */}
      <section className="collection-section" id="collection">
        <div className="section-header-editorial">
          <div className="section-eyebrow">
            <DiyaIcon size={16} active={true} />
            <span>Seasonal Edit</span>
          </div>
          <h2 className="section-main-title">Handcrafted Kurtha Sets</h2>
          <p className="section-main-desc">
            Each silhouette is tailored for celebration. No generic colorways — every kurtha is its own
            dedicated festive creation.
          </p>

          {/* Dynamic Category Filter Pills from Django */}
          <div className="filter-pill-bar">
            {categories.map(cat => (
              <button
                key={cat.id || cat.slug}
                type="button"
                className={`filter-btn ${activeCategorySlug === cat.slug ? 'active' : ''}`}
                onClick={() => setActiveCategorySlug(cat.slug)}
              >
                <span>{cat.name}</span>

              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="product-editorial-grid">
          {filteredProducts.map(product => {
            const discount = product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;

            return (
              <article key={product.id} className="editorial-product-card">
                {/* Badge Tag */}
                {product.badge && (
                  <div className="cut-corner-badge">
                    <span>{product.badge}</span>
                  </div>
                )}

                {/* Taller Image Crop */}
                <div className="card-media-wrapper">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="card-product-img"
                  />
                  <div className="card-media-overlay" />
                  <Link
                    to={`/product/${product.id}`}
                    className="card-quick-link"
                    aria-label={`View ${product.name}`}
                  >
                    <span>View Specifications</span>
                    <ArrowRightIcon size={14} />
                  </Link>
                </div>

                {/* Product Meta */}
                <div className="card-body">
                  <div className="card-fabric-tag">
                    {product.fabricType} • {product.pieces}
                  </div>

                  <Link to={`/product/${product.id}`} className="card-title-link">
                    <h3 className="card-title">{product.name}</h3>
                  </Link>

                  

                  {/* Clean Non-Wrapping Tabular Price Row */}
                  <div className="card-clean-price-row">
                    <span className="sale-price tabular-num">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="mrp-price tabular-num">
                        Rs. {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="discount-cut-badge">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Size Chips with Distinct States */}
                  <div className="size-chips-strip">
                    {Object.entries(product.sizes || {}).map(([size, count]) => {
                      const isOutOfStock = count === 0;
                      const isFew = count > 0 && count <= 2;

                      return (
                        <div
                          key={size}
                          className={`size-mini-chip ${isOutOfStock ? 'chip-oos' : isFew ? 'chip-few' : 'chip-ok'}`}
                          title={isOutOfStock ? `${size}: Out of Stock` : isFew ? `${size}: Only ${count} left!` : `${size}: ${count} available`}
                        >
                          <span className="chip-label">{size}</span>
                          {isFew && <span className="chip-alert">1 left</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="card-footer-actions">
                    <Link to={`/product/${product.id}`} className="btn-select-size">
                      <span>Select Size &amp; Bag</span>
                    </Link>
                    <a
                      href={getWaLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-card-wa"
                      title="Direct WhatsApp Order"
                      aria-label="Direct WhatsApp Order"
                    >
                      <WhatsAppIcon size={18} />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── 6b. VENGEANCE PERSPECTIVE CAROUSEL ── */}
      <PerspectiveCarousel
        items={products}
        title="Festive Lookbook Showcase"
        subtitle="Curated 3D Collection Showcase"
      />

      {/* ── 7. GARLAND DIVIDER ── */}
      <GarlandDivider className="section-divider" />

      {/* ── 8. OUR STORY (DYNAMIC) & SIGNATURE "LIGHT A DIYA" INTERACTION ── */}
      <section className="story-section" id="story" style={{ position: 'relative' }}>
        {/* Magic UI Warm Particles / Diya Embers */}
        <Particles quantity={35} color="#ff9f1c" className="story-diya-particles" />

        <div className="story-card-grid" style={{ position: 'relative', zIndex: 3 }}>
          <div className="story-content">
            <div className="story-tag">
              <DiyaIcon size={16} active={true} />
              <span>{storyTag}</span>
            </div>
            <h2 className="story-title">
              {storyTitle}
            </h2>
            <p className="story-paragraph">
              {storyP1}
            </p>
            <p className="story-paragraph">
              {storyP2}
            </p>

            {/* ── SIGNATURE INTERACTION: LIGHT A DIYA ── */}
            <div className="light-a-diya-widget">
              <div className="diya-widget-header">
                <div className={`widget-diya-flame-box ${userDiyaLit ? 'is-lit' : ''} ${diyaJustLit ? 'flare' : ''}`}>
                  <DiyaIcon size={34} active={userDiyaLit} />
                </div>
                <div>
                  <div className="widget-count-number tabular-num">
                    {diyasCount.toLocaleString()} Diyas Lit
                  </div>
                  <div className="widget-count-sub">
                    {userDiyaLit ? 'Your prayer for prosperity has been added!' : 'Join our festive celebration across Nepal'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`btn-light-diya ${userDiyaLit ? 'already-lit' : ''}`}
                onClick={handleLightDiya}
                disabled={userDiyaLit}
              >
                <DiyaIcon size={18} active={userDiyaLit} />
                <span>{userDiyaLit ? 'Your Diya is Shining' : 'Light a Diya for Prosperity'}</span>
              </button>
            </div>
          </div>

          <div className="story-visual-mosaic">
            <div className="mosaic-card-top">
              <img src="/images/kurtha-red-gold.png" alt="LoveKod festive red and gold kurtha" />
            </div>
            <div className="mosaic-quote-box">
              <div className="quote-serif">
                "{storyQuote}"
              </div>
              <div className="quote-author">— {storyQuoteAuthor}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. DYNAMIC REVIEWS SECTION FROM DJANGO ── */}
      {testimonials && testimonials.length > 0 && (
        <section className="reviews-staggered-section" id="reviews">
          <div className="section-header-editorial">
            <div className="section-eyebrow">
              <StarIcon size={15} filled={true} />
              <span>Boutique Experiences</span>
            </div>
            <h2 className="section-main-title">Worn with Love for Tihar</h2>
            <p className="section-main-desc">
              Authentic words from sisters and festive shoppers across Nepal
            </p>
          </div>

          {/* Aceternity Infinite Moving Cards */}
          <InfiniteMovingCards items={testimonials} speed="normal" pauseOnHover={true} />
        </section>
      )}
    </div>
  );
}
