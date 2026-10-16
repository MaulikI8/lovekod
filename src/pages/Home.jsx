import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import GarlandDivider from '../components/GarlandDivider';
import Spotlight from '../components/ui/Spotlight';
import HeroHotspots from '../components/ui/HeroHotspots';
import CountdownTimer from '../components/ui/CountdownTimer';
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
  const { products, categories, siteSettings, testimonials, addToCart, setCartOpen } = useStore();
  const [activeCategorySlug, setActiveCategorySlug] = useState('all');
  const [mobilePanelIndex, setMobilePanelIndex] = useState(1);
  const [selectedSizes, setSelectedSizes] = useState({}); // { [productId]: 'M' }

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

    const handleSelectSize = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleCardAddToBag = (product) => {
    const chosenSize = selectedSizes[product.id];
    if (!chosenSize) return;
    addToCart(product.id, chosenSize);
    setCartOpen(true);
  };

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
              Georgette and silk, hand-embroidered. Delivering across all 77 districts.
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

      {/* ── 2. FESTIVE BHAI TIKA COUNTDOWN (Skiper-UI / NumberFlow) ── */}
      <CountdownTimer />

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
                <span>Featured this week</span>
              </div>
            </div>

            <div className="spotlight-story">
              <div className="spotlight-label">
                <MarigoldIcon size={16} />
                <span>{siteSettings?.spotlightBadge || 'SIGNATURE TIHAR SET'}</span>
              </div>
              <h2 className="spotlight-title">{siteSettings?.spotlightTitle || featuredProduct.name}</h2>

              <p className="spotlight-desc">
                Pure georgette with silver needlework across the collar and cuffs. Complete three-piece set with a matching lightweight lower and scalloped dupatta.
              </p>

              <div className="spotlight-highlights">
                <div className="highlight-item">
                  <CheckIcon size={16} />
                  <span>Includes {featuredProduct.pieces}: Kurtha, Matching Lower &amp; Dupatta</span>
                </div>
                <div className="highlight-item">
                  <CheckIcon size={16} />
                  <span>Handcrafted silver zari split-collar embroidery</span>
                </div>
                <div className="highlight-item">
                  <CheckIcon size={16} />
                  <span>Measured against standard fits with generous seam allowances</span>
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
                    <span>View details</span>
                    <ArrowRightIcon size={16} />
                  </Link>
                  <a
                    href={getWaLink(featuredProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-square"
                    title="Order on WhatsApp"
                    aria-label="Order on WhatsApp"
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
            <span>SEASONAL EDIT</span>
          </div>
          <h2 className="section-main-title">Handcrafted Kurtha Sets</h2>
          <p className="section-main-desc">
            Festive kurtha sets in georgette, silk blend and cotton silk. Each style is made in small batches.
          </p>

          {/* Rectangular Tab Row (NO pills) */}
          <div className="filter-pill-bar" role="tablist">
            {categories.map(cat => (
              <button
                key={cat.id || cat.slug}
                type="button"
                role="tab"
                aria-selected={activeCategorySlug === cat.slug}
                className={`filter-btn ${activeCategorySlug === cat.slug ? 'active' : ''}`}
                onClick={() => setActiveCategorySlug(cat.slug)}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
          <div className="filter-result-count">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'set' : 'sets'}
          </div>
        </div>

        {/* Product Grid */}
        <div className="product-editorial-grid">
          {filteredProducts.map(product => {
            const discount = product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;

            const selectedSize = selectedSizes[product.id];
            const fewSizes = Object.entries(product.sizes || {})
              .filter(([_, count]) => count > 0 && count <= 2)
              .map(([sz]) => sz);

            return (
              <article key={product.id} className="editorial-product-card">
                {/* Badge Tag */}
                {product.badge && (
                  <div className="cut-corner-badge">
                    <span>{product.badge}</span>
                  </div>
                )}

                {/* Media Image Crop (4:5) */}
                <div className="card-media-wrapper">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="card-product-img"
                  />
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

                  {/* Size Chips: 40x40 Rectangular Buttons */}
                  <div className="size-chips-strip" role="group" aria-label="Available Sizes">
                    {Object.entries(product.sizes || {}).map(([size, count]) => {
                      const isOutOfStock = count === 0;
                      const isFew = count > 0 && count <= 2;
                      const isSelected = selectedSize === size;

                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={isOutOfStock}
                          aria-pressed={isSelected}
                          aria-disabled={isOutOfStock}
                          onClick={() => handleSelectSize(product.id, size)}
                          className={`size-select-btn ${isSelected ? 'is-selected' : ''} ${isFew ? 'is-few' : ''} ${isOutOfStock ? 'is-oos' : ''}`}
                          title={isOutOfStock ? `${size}: Out of Stock` : isFew ? `${size}: Only ${count} left!` : `${size}: In stock`}
                        >
                          <span>{size}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Data-driven low stock warning */}
                  {fewSizes.length > 0 && (
                    <div className="size-low-stock-note">
                      Only 1 left in {fewSizes.join(', ')}
                    </div>
                  )}

                  {/* Actions: Add to bag + WhatsApp */}
                  <div className="card-footer-actions">
                    <button
                      type="button"
                      disabled={!selectedSize}
                      onClick={() => handleCardAddToBag(product)}
                      className="btn-card-add-bag"
                    >
                      <span>{selectedSize ? `Add to bag (${selectedSize})` : 'Select a size'}</span>
                    </button>
                    <a
                      href={getWaLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-card-wa-icon"
                      title="Order on WhatsApp"
                      aria-label="Order on WhatsApp"
                    >
                      <WhatsAppIcon size={20} />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* You May Also Like Row if filter returns fewer than 3 */}
        {filteredProducts.length > 0 && filteredProducts.length < 3 && (
          <div style={{ marginTop: '48px', borderTop: '1px solid var(--line)', paddingTop: '32px' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '18px' }}>
              You may also like
            </h4>
            <div className="product-editorial-grid">
              {products.filter(p => !filteredProducts.find(fp => fp.id === p.id)).slice(0, 3).map(rec => (
                <article key={rec.id} className="editorial-product-card">
                  <div className="card-media-wrapper">
                    <img src={rec.image} alt={rec.name} className="card-product-img" />
                  </div>
                  <div className="card-body">
                    <div className="card-fabric-tag">{rec.fabricType}</div>
                    <Link to={`/product/${rec.id}`}>
                      <h3 className="card-title">{rec.name}</h3>
                    </Link>
                    <div className="card-clean-price-row">
                      <span className="sale-price tabular-num">Rs. {rec.price.toLocaleString()}</span>
                    </div>
                    <Link to={`/product/${rec.id}`} className="btn-primary-marigold" style={{ height: '40px', fontSize: '0.85rem', justifyContent: 'center' }}>
                      <span>View details</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── 6b. VENGEANCE PERSPECTIVE CAROUSEL ── */}
      <PerspectiveCarousel
        items={products}
        title="Festive Lookbook Showcase"
        subtitle="Curated 3D Collection Showcase"
      />

      {/* ── 8. OUR STORY (DYNAMIC) & SIGNATURE "LIGHT A DIYA" INTERACTION ── */}
      <section className="story-section" id="story">
        <div className="story-card-grid">
          <div className="story-content">
            <div className="story-tag">
              <DiyaIcon size={16} active={true} />
              <span>OUR STORY</span>
            </div>
            <h2 className="story-title">
              The LoveKod ethos <span className="story-title-devanagari">लभकोण</span>
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
                <div className="widget-diya-flame-box">
                  <DiyaIcon size={28} active={userDiyaLit} />
                </div>
                <div>
                  <div className="widget-count-number tabular-num">
                    {diyasCount.toLocaleString()} <span>diyas lit</span>
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
                <span>{userDiyaLit ? 'Your diya is shining' : 'Light a diya'}</span>
              </button>
            </div>
          </div>

          <div className="story-visual-mosaic">
            <div className="mosaic-card-top">
              <img src="/images/kurtha-red-gold.png" alt="LoveKod festive red and gold kurtha set" />
            </div>
            <div className="mosaic-quote-box">
              <div className="quote-serif">
                "{storyQuote}"
              </div>
              <div className="quote-author">THE LOVEKOD STUDIO, KATHMANDU</div>
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
