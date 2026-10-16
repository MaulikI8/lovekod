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
import { PerspectiveCarousel } from "@/components/ui/perspective-carousel";
import { StaggeredGrid } from "@/components/ui/staggered-grid";
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
                <Link to={`/product/${product.id}`} className="card-media-wrapper" tabIndex={-1} aria-hidden="true">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="card-product-img"
                  />
                </Link>

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
                  <Link to={`/product/${product.id}`} className="card-media-wrapper" tabIndex={-1} aria-hidden="true">
                    <img src={rec.image} alt={rec.name} className="card-product-img" />
                  </Link>
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
      <section className="perspective-carousel-section" id="lookbook" style={{ padding: '48px 0 64px' }}>
        <div className="section-header-editorial">
          <div className="section-eyebrow">
            <span>Curated 3D Collection Showcase</span>
          </div>
          <h2 className="section-main-title">Festive Lookbook Showcase</h2>
          <p className="section-main-desc">
            Spring-physics 3D perspective gallery featuring handcrafted festive silhouettes
          </p>
        </div>

        <div className="relative w-full max-w-6xl mx-auto px-4 mt-6">
          <PerspectiveCarousel
            items={products.map(p => ({
              src: p.image,
              title: `${p.name} • Rs. ${p.price.toLocaleString()}`,
              alt: p.name,
              id: p.id
            }))}
            defaultActiveIndex={2}
            slideWidth={220}
            className="perspective-carousel-shell h-[520px] rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-sm"
          />
        </div>
      </section>


      {/* ── 8. ARTISANAL CRAFTSMANSHIP & ATELIER PROMISES (STAGGERED GRID) ── */}
      <section className="atelier-craft-section max-w-6xl mx-auto px-4 py-16" id="craft">
        <div className="section-header-editorial mb-10">
          <div className="section-eyebrow">
            <SparklesIcon size={14} />
            <span>The LoveKod Atelier</span>
          </div>
          <h2 className="section-main-title">Festive Craftsmanship &amp; Promises</h2>
          <p className="section-main-desc">
            Engineered specifically for Tihar ceremonies and Bhai Tika gatherings with zero compromise on comfort
          </p>
        </div>

        <StaggeredGrid
          columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          items={[
            {
              title: "Pure Georgette & Silks",
              description: "Lightweight, breathable weaves hand-picked for effortless movement from morning Laxmi Puja to evening Bhai Tika ceremonies."
            },
            {
              title: "Nepali Standard Sizing",
              description: "Tailored to Nepali feminine proportions with generous seam margins for comfortable day-long festive wear."
            },
            {
              title: "Priority 77-District Dispatch",
              description: "Fast express dispatch across Nepal to ensure your celebratory attire arrives well in time for Tihar."
            }
          ]}
        />
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
