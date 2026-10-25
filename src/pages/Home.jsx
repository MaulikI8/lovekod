import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import GarlandDivider from '../components/GarlandDivider';
import CountdownTimer from '../components/ui/CountdownTimer';
import HeroStrip from '../components/home/HeroStrip';
import FeaturedSpotlight from '../components/home/FeaturedSpotlight';
import CuratedCollection from '../components/home/CuratedCollection';
import LookbookCarousel from '../components/home/LookbookCarousel';
import CustomerReviews from '../components/home/CustomerReviews';

/**
 * Editorial Homepage for LoveKod Atelier.
 * Structured cleanly into modular, maintainable domain components.
 */
export default function Home() {
  const { products, categories, siteSettings, testimonials, addToCart, setCartOpen } = useStore();
  const [activeCategorySlug, setActiveCategorySlug] = useState('all');
  const [selectedSizes, setSelectedSizes] = useState({});

  // Filter Products by Category Slug
  const filteredProducts = products.filter((p) => {
    if (activeCategorySlug === 'all') return true;
    const cat = categories.find((c) => c.slug === activeCategorySlug);
    if (!cat) return true;
    // Check direct foreign key relations
    if (p.categoryId && (p.categoryId === cat.id || p.categoryId === cat.id.toString())) {
      return true;
    }
    if (p.categorySlug && p.categorySlug === activeCategorySlug) {
      return true;
    }
    if (p.category && (p.category.slug === activeCategorySlug || p.category.id === cat.id)) {
      return true;
    }
    if (p.categoryName && cat.name && p.categoryName.toLowerCase() === cat.name.toLowerCase()) {
      return true;
    }
    // Fallback: check fabric name or category keywords
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
  const featuredProduct = products.find((p) => p.id === spotlightPid) || products[0];

  const handleSelectSize = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleCardAddToBag = (product) => {
    const chosenSize = selectedSizes[product.id];
    if (!chosenSize) return;
    addToCart(product.id, chosenSize);
    setCartOpen(true);
  };

  const waPhone = siteSettings?.contactWhatsapp || '9779717567133';

  return (
    <div className="home-container">
      {/* ── 1. FULL-BLEED THREE-PANEL STRIP HERO WITH HOTSPOTS ── */}
      <HeroStrip siteSettings={siteSettings} products={products} />

      {/* ── 2. FESTIVE BHAI TIKA COUNTDOWN ── */}
      <CountdownTimer />

      {/* ── 3. GARLAND DIVIDER ── */}
      <GarlandDivider className="section-divider" />

      {/* ── 4. OVERSIZED EDITORIAL PRODUCT FEATURE ── */}
      {featuredProduct && (
        <FeaturedSpotlight
          product={featuredProduct}
          siteSettings={siteSettings}
          waPhone={waPhone}
        />
      )}

      {/* ── 5. GARLAND DIVIDER ── */}
      <GarlandDivider className="section-divider" />

      {/* ── 6. CURATED FESTIVE COLLECTION ── */}
      <CuratedCollection
        categories={categories}
        activeCategorySlug={activeCategorySlug}
        setActiveCategorySlug={setActiveCategorySlug}
        filteredProducts={filteredProducts}
        products={products}
        selectedSizes={selectedSizes}
        onSelectSize={handleSelectSize}
        onAddToBag={handleCardAddToBag}
        waPhone={waPhone}
      />

      {/* ── 7. PERSPECTIVE CAROUSEL / LOOKBOOK ── */}
      <LookbookCarousel products={products} siteSettings={siteSettings} />

      {/* ── 8. TESTIMONIALS / CUSTOMER REVIEWS ── */}
      <CustomerReviews testimonials={testimonials} />
    </div>
  );
}
