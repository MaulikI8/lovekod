import { Link } from 'react-router-dom';
import { DiyaIcon, WhatsAppIcon } from '../Icons';
import Skiper104ScrollCard from '../ui/skiper-ui/skiper104';
import { formatPrice, calcDiscount, getWhatsAppLink } from '../../utils/format';

/**
 * Curated festive collection section.
 * Renders filter tabs, product editorial cards with size chips and stock alerts.
 */
export default function CuratedCollection({
  categories = [],
  activeCategorySlug,
  setActiveCategorySlug,
  filteredProducts = [],
  products = [],
  selectedSizes = {},
  onSelectSize,
  onAddToBag,
  waPhone,
}) {
  return (
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
          {categories.map((cat) => (
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
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--ink)', marginBottom: '8px' }}>
            No garments in this collection yet.
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            New handcrafted couture sets are being added by our studio concierge.
          </p>
        </div>
      ) : (
        <div className="product-editorial-grid">
          {filteredProducts.map((product, pIdx) => {
          const discount = calcDiscount(product.originalPrice, product.price);
          const selectedSize = selectedSizes[product.id];
          const lowStockEntries = Object.entries(product.sizes || {})
            .filter(([_, count]) => count > 0 && count <= 2);
          const lowStockNote = lowStockEntries
            .map(([sz, count]) => `${count} left in ${sz}`)
            .join(' · ');

          return (
            <Skiper104ScrollCard key={product.id} index={pIdx}>
              <article className="editorial-product-card h-full">
                {/* Badge Tag */}
                {product.badge && (
                  <div className="cut-corner-badge">
                    <span>{product.badge}</span>
                  </div>
                )}

                {/* Media Image Crop (4:5) */}
                <Link
                  to={`/product/${product.id}`}
                  className="card-media-wrapper"
                  tabIndex={-1}
                  aria-hidden="true"
                >
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
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="mrp-price tabular-num">
                        {formatPrice(product.originalPrice)}
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
                          onClick={() => onSelectSize(product.id, size)}
                          className={`size-select-btn ${isSelected ? 'is-selected' : ''} ${isFew ? 'is-few' : ''} ${isOutOfStock ? 'is-oos' : ''}`}
                          title={isOutOfStock ? `${size}: Out of Stock` : isFew ? `${size}: Only ${count} left!` : `${size}: In stock`}
                        >
                          <span>{size}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Data-driven low stock warning */}
                  {lowStockNote && (
                    <div className="size-low-stock-note">
                      {lowStockNote}
                    </div>
                  )}

                  {/* Actions: Add to bag + WhatsApp */}
                  <div className="card-footer-actions">
                    <button
                      type="button"
                      disabled={!selectedSize}
                      onClick={() => onAddToBag(product)}
                      className="btn-card-add-bag"
                    >
                      <span>{selectedSize ? `Add to bag (${selectedSize})` : 'Select a size'}</span>
                    </button>
                    <a
                      href={getWhatsAppLink(product, waPhone)}
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
            </Skiper104ScrollCard>
          );
        })}
        </div>
      )}

      {/* You May Also Like Row if filter returns fewer than 3 */}
      {filteredProducts.length > 0 && filteredProducts.length < 3 && (
        <div style={{ marginTop: '48px', borderTop: '1px solid var(--line)', paddingTop: '32px' }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '18px' }}>
            You may also like
          </h4>
          <div className="product-editorial-grid">
            {products
              .filter((p) => !filteredProducts.find((fp) => fp.id === p.id))
              .slice(0, 3)
              .map((rec) => (
                <article key={rec.id} className="editorial-product-card">
                  <Link
                    to={`/product/${rec.id}`}
                    className="card-media-wrapper"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <img src={rec.image} alt={rec.name} className="card-product-img" />
                  </Link>
                  <div className="card-body">
                    <div className="card-fabric-tag">{rec.fabricType}</div>
                    <Link to={`/product/${rec.id}`}>
                      <h3 className="card-title">{rec.name}</h3>
                    </Link>
                    <div className="card-clean-price-row">
                      <span className="sale-price tabular-num">{formatPrice(rec.price)}</span>
                    </div>
                    <Link
                      to={`/product/${rec.id}`}
                      className="btn-primary-marigold"
                      style={{ height: '40px', fontSize: '0.85rem', justifyContent: 'center' }}
                    >
                      <span>View details</span>
                    </Link>
                  </div>
                </article>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
