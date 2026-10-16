import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import GarlandDivider from '../components/GarlandDivider';
import {
  DiyaIcon,
  ShoppingBagIcon,
  WhatsAppIcon,
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  CloseIcon,

} from '../components/Icons';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, siteSettings } = useStore();

  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  if (!product) {
    return (
      <div className="section not-found-section">
        <h2>Product Not Found</h2>
        <p>The kurtha you are looking for does not exist or has been retired from the collection.</p>
        <Link to="/" className="btn-primary-marigold">Return to Collection</Link>
      </div>
    );
  }

  const sizes = product.sizes || {};
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(product.id, selectedSize);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(product.id, selectedSize);
    navigate('/checkout');
  };

  const getWaLink = () => {
    const sizeText = selectedSize ? `in size ${selectedSize}` : '';
    const text = encodeURIComponent(
      `Namaste LoveKod! I would like to order "${product.name}" ${sizeText} (Rs. ${product.price.toLocaleString()}) for Tihar. Please share delivery details.`
    );
    return `https://wa.me/9779800000000?text=${text}`;
  };

  const related = products.filter(p => p.id !== product.id).slice(0, 3);

  return (
    <div className="pd-page">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="pd-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="bc-sep">/</span>
        <a href="/#collection">Collection</a>
        <span className="bc-sep">/</span>
        <span className="bc-current">{product.name}</span>
      </nav>

      <div className="pd-grid">
        {/* Left: Product Imagery with warm ambient frame */}
        <div className="pd-image-frame">
          <img src={product.image} alt={product.name} className="pd-main-img" />
          {product.badge && (
            <div className="pd-cut-badge">
              <span>{product.badge}</span>
            </div>
          )}
        </div>

        {/* Right: Detailed Product & Sizing Panel */}
        <div className="pd-info-panel">
          <div className="pd-fabric-strip">
            <span className="fabric-pill">{product.fabricType}</span>
            <span className="pill-dot">•</span>
            <span className="fabric-pill">{product.pieces}</span>
          </div>

          <h1 className="pd-title">{product.name}</h1>
          

          {/* Clean Non-Wrapping Tabular Price Row */}
          <div className="pd-price-row">
            <span className="pd-price-now tabular-num">
              Rs. {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="pd-price-mrp tabular-num">
                Rs. {product.originalPrice.toLocaleString()}
              </span>
            )}
            {discount > 0 && (
              <span className="pd-discount-tag">
                {discount}% OFF
              </span>
            )}
          </div>

          <p className="pd-desc">{product.description}</p>

          {/* ── Size Selector ── */}
          <div className={`size-section-wrap ${sizeError ? 'has-error' : ''}`}>
            <div className="size-header-bar">
              <span className="size-label-text">Select Size:</span>
              <button
                type="button"
                className="btn-size-guide-toggle"
                onClick={() => setShowSizeGuide(!showSizeGuide)}
              >
                <span>Size Chart &amp; Fit</span>
              </button>
            </div>

            {/* Size Guide Drawer */}
            {showSizeGuide && (
              <div className="size-guide-panel">
                <div className="size-guide-header">
                  <span>Standard Kurtha Fit Chart (Inches)</span>
                  <button
                    type="button"
                    className="close-guide-btn"
                    onClick={() => setShowSizeGuide(false)}
                    aria-label="Close size guide"
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>
                <table className="size-guide-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Bust</th>
                      <th>Waist</th>
                      <th>Hip</th>
                      <th>Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>M</td><td>38"</td><td>34"</td><td>40"</td><td>44"</td></tr>
                    <tr><td>L</td><td>40"</td><td>36"</td><td>42"</td><td>44"</td></tr>
                    <tr><td>XL</td><td>42"</td><td>38"</td><td>44"</td><td>45"</td></tr>
                    <tr><td>XXL</td><td>44"</td><td>40"</td><td>46"</td><td>45"</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Distinct State Size Buttons */}
            <div className="size-buttons-grid">
              {['M', 'L', 'XL', 'XXL'].map(size => {
                const stock = sizes[size] || 0;
                const isSelected = selectedSize === size;
                const isOutOfStock = stock === 0;
                const isLow = stock > 0 && stock <= 2;

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                    className={`size-choice-btn ${isSelected ? 'is-selected' : isOutOfStock ? 'is-out-of-stock' : isLow ? 'is-low-stock' : 'is-available'}`}
                  >
                    <span className="choice-size-name">{size}</span>
                    <span className="choice-status">
                      {isOutOfStock ? (
                        'Sold Out'
                      ) : isLow ? (
                        `${stock} left`
                      ) : (
                        'In Stock'
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {sizeError && (
              <div className="size-error-notice">
                Please select your preferred kurtha size to proceed.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pd-actions-row">
            <button
              type="button"
              className="btn-primary-marigold btn-add-bag"
              onClick={handleAddToCart}
            >
              <ShoppingBagIcon size={18} />
              <span>Add to Shopping Bag</span>
            </button>

            <button
              type="button"
              className="btn-secondary-outline btn-buy-now"
              onClick={handleBuyNow}
            >
              <span>Instant Buy</span>
            </button>

            <a
              href={getWaLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-square"
              title="Inquire or Order via WhatsApp"
              aria-label="Order on WhatsApp"
            >
              <WhatsAppIcon size={20} />
            </a>
          </div>

          {/* Festive Guarantees Strip */}
          <div className="pd-guarantee-list">
            <div className="guarantee-item">
              <DiyaIcon size={18} active={true} />
              <div>
                <strong>Tihar Ready:</strong> Priority dispatch within 24 hours to reach before Bhai Tika.
              </div>
            </div>
            <div className="guarantee-item">
              <TruckIcon size={18} />
              <div>
                <strong>Nationwide Delivery:</strong> Fast express shipping across all 77 districts in Nepal.
              </div>
            </div>
            <div className="guarantee-item">
              <ShieldCheckIcon size={18} />
              <div>
                <strong>Flexible Payment:</strong> Cash on Delivery (COD), eSewa, Khalti, or Bank Transfer.
              </div>
            </div>
            <div className="guarantee-item">
              <SparklesIcon size={18} />
              <div>
                <strong>3-Day Exchange:</strong> Hassle-free size adjustment guarantee.
              </div>
            </div>
          </div>
        </div>
      </div>

      <GarlandDivider className="section-divider" />

      {/* ── Related Kurthas ── */}
      {related.length > 0 && (
        <section className="pd-related-section">
          <div className="section-header-editorial">
            <h3 className="section-main-title">More Festive Looks</h3>
            <p className="section-main-desc">Explore alternative fabric drapes for Bhai Tika</p>
          </div>

          <div className="product-editorial-grid">
            {related.map(item => (
              <article key={item.id} className="editorial-product-card">
                <div className="card-media-wrapper">
                  <img src={item.image} alt={item.name} />
                  <Link to={`/product/${item.id}`} className="card-quick-link">
                    <span>Inspect Kurtha</span>
                    <ArrowRightIcon size={14} />
                  </Link>
                </div>
                <div className="card-body">
                  <div className="card-fabric-tag">{item.fabricType} • {item.pieces}</div>
                  <Link to={`/product/${item.id}`} className="card-title-link">
                    <h4 className="card-title">{item.name}</h4>
                  </Link>
                  <div className="card-clean-price-row">
                    <span className="sale-price tabular-num">Rs. {item.price.toLocaleString()}</span>
                  </div>
                  <Link to={`/product/${item.id}`} className="btn-select-size" style={{ marginTop: '12px' }}>
                    Select Size
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
